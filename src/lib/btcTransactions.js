import {
  decodeBase58Address,
  decodeTransaction,
  encodeBase58AddressFormat,
  hexToBin,
} from '@bitauth/libauth';
import { sha256 } from '@noble/hashes/sha256';
import {
  bufferCV,
  callReadOnlyFunction,
  ClarityType,
  cvToString,
  listCV,
  tupleCV,
  uintCV,
} from '@stacks/transactions';
import reverse from 'buffer-reverse';
import { b58ToC32 } from 'c32check';
import MerkleTree from 'merkletreejs';
import { blocksApi, CLARITY_BITCOIN_CONTRACT, CONTRACT_ADDRESS, NETWORK } from './constants';

export const ERR_DIFFERENT_HEX = 'different hex';
export const ERR_NO_STACKS_BLOCK = 'no stacks block';
export const ERR_API_FAILURE = 'api failure';
const network = NETWORK;

export async function getReversedTxId(txCV) {
  const result = await callReadOnlyFunction({
    contractAddress: CLARITY_BITCOIN_CONTRACT.address,
    contractName: CLARITY_BITCOIN_CONTRACT.name,

    functionName: 'get-reversed-txid',
    functionArgs: [txCV],
    senderAddress: CONTRACT_ADDRESS,
    network,
  });
  console.log('getReversedTxId', cvToString(result));
  return result;
}

export async function concatTransaction(txPartsCV) {
  const result = await callReadOnlyFunction({
    contractAddress: CLARITY_BITCOIN_CONTRACT.address,
    contractName: CLARITY_BITCOIN_CONTRACT.name,
    functionName: 'concat-tx',
    functionArgs: [txPartsCV],
    senderAddress: CLARITY_BITCOIN_CONTRACT.address,
    network,
  });
  console.log('concat-tx', cvToString(result));
  return result;
}

export async function getTxId(txBuffCV) {
  const result = await callReadOnlyFunction({
    contractAddress: CLARITY_BITCOIN_CONTRACT.address,
    contractName: CLARITY_BITCOIN_CONTRACT.name,
    functionName: 'get-txid',
    functionArgs: [txBuffCV],
    senderAddress: CONTRACT_ADDRESS,
    network,
  });
  console.log('txid', cvToString(result));
  return result;
}

export async function wasTxMined(blockPartsCV, txCV, proofCV) {
  const result = await callReadOnlyFunction({
    contractAddress: CLARITY_BITCOIN_CONTRACT.address,
    contractName: CLARITY_BITCOIN_CONTRACT.name,
    functionName: 'was-tx-mined',
    functionArgs: [blockPartsCV, txCV, proofCV],
    senderAddress: CONTRACT_ADDRESS,
    network,
  });
  console.log('was-tx-mined', cvToString(result));
  return result;
}

export async function parseTx(txCV) {
  // parse tx
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CLARITY_BITCOIN_CONTRACT.address,
      contractName: CLARITY_BITCOIN_CONTRACT.name,
      functionName: 'parse-tx',
      functionArgs: [txCV],
      senderAddress: CONTRACT_ADDRESS,
      network,
    });
    console.log('parse-tx', cvToString(result));
  } catch (e) {
    console.log('parse-tx failed', e.toString());
  }
}

export async function verifyMerkleProof(txId, block, proofCV) {
  const result = await callReadOnlyFunction({
    contractAddress: CLARITY_BITCOIN_CONTRACT.address,
    contractName: CLARITY_BITCOIN_CONTRACT.name,
    functionName: 'verify-merkle-proof',
    functionArgs: [
      bufferCV(reverse(MerkleTree.bufferify(txId))),
      bufferCV(reverse(MerkleTree.bufferify(block.mrkl_root))),
      proofCV,
    ],
    senderAddress: CONTRACT_ADDRESS,
    network,
  });
  console.log('verify-merkle-proof', JSON.stringify(result), cvToString(result));
  return result;
}

export async function verifyMerkleProof2(txCV, headerPartsCV, proofCV) {
  const result = await callReadOnlyFunction({
    contractAddress: CLARITY_BITCOIN_CONTRACT.address,
    contractName: CLARITY_BITCOIN_CONTRACT.name,
    functionName: 'verify-merkle-proof',
    functionArgs: [await getReversedTxId(txCV), headerPartsCV.data['merkle-root'], proofCV],
    senderAddress: CONTRACT_ADDRESS,
    network,
  });
  console.log('verify-merkle-proof-2', JSON.stringify(result), cvToString(result));
  return result;
}

export async function wasTxMinedFromHex(blockCV, txCV, proofCV) {
  const result = await callReadOnlyFunction({
    contractAddress: CLARITY_BITCOIN_CONTRACT.address,
    contractName: CLARITY_BITCOIN_CONTRACT.name,
    functionName: 'was-tx-mined-compact',
    functionArgs: [blockCV, txCV, proofCV],
    senderAddress: CONTRACT_ADDRESS,
    network,
  });
  console.log('was-tx-mined-compact', JSON.stringify(result));
  return result;
}

export async function parseBlockHeader(blockHeader) {
  const result = await callReadOnlyFunction({
    contractAddress: CLARITY_BITCOIN_CONTRACT.address,
    contractName: CLARITY_BITCOIN_CONTRACT.name,

    functionName: 'parse-block-header',
    functionArgs: [bufferCV(Buffer.from(blockHeader, 'hex'))],
    senderAddress: CONTRACT_ADDRESS,
    network,
  });
  console.log('parse block header', cvToString(result.value.data['merkle-root']));
  return result;
}

export async function verifyBlockHeader(parts, stacksBlockHeight) {
  const result = await callReadOnlyFunction({
    contractAddress: CLARITY_BITCOIN_CONTRACT.address,
    contractName: CLARITY_BITCOIN_CONTRACT.name,
    functionName: 'verify-block-header',
    functionArgs: [
      bufferCV(Buffer.from(parts[0] + parts[1] + parts[2] + parts[3] + parts[4] + parts[5], 'hex')),
      uintCV(stacksBlockHeight),
    ],
    senderAddress: CONTRACT_ADDRESS,
    network,
  });
  console.log('verify-block-header', cvToString(result));
  return result;
}

export async function verifyBlockHeader2(blockCV) {
  const result = await callReadOnlyFunction({
    contractAddress: CLARITY_BITCOIN_CONTRACT.address,
    contractName: CLARITY_BITCOIN_CONTRACT.name,
    functionName: 'verify-block-header',
    functionArgs: [blockCV.data['header'], blockCV.data['height']],
    senderAddress: CONTRACT_ADDRESS,
    network,
  });
  console.log('verify-block-header-2', cvToString(result));
  return result;
}

export function numberToBuffer(value, size) {
  // increase size by 1 for "too large" numbers
  const buf = Buffer.alloc(size + 1);
  if (size === 4) {
    buf.writeIntLE(value, 0, size + 1);
  } else if (size === 8) {
    buf.writeUInt32LE(value, 0, size + 1);
  } else {
    console.log(`unsupported size ${size}`);
    // not supported
  }
  // remove the extra byte again
  return buf.slice(0, size);
}

// return something like this
// "0200000001fbfaf2992b0ec1c24b237c7c8a8e6dfee0d19d18544e76cfa3e6ae4d20d7e2650000000000fdffffff02d8290800000000001976a914dd2c7d66ea6df0629fc222929311d0eb7d9146b588ac42a14700000000001600142a551add041ec0ffd755b5a993afa7a11ca59b0b1a900a00"
// without witness
function txForHash(txHex) {
  const transaction = decodeTransaction(hexToBin(txHex));
  transaction.toHex();
  return transaction.toBuffer().toString('hex');
}

async function getStxBlock(bitcoinBlockHeight) {
  let limit = 30;
  let offset = 0;
  const firstResponse = await blocksApi.getBlockList({ offset, limit });
  let stxBlock = firstResponse.results.find(b => b.burn_block_height === bitcoinBlockHeight);
  offset += Math.max(limit, firstResponse.results[0].burn_block_height - bitcoinBlockHeight);
  console.log('getStxBlock', { offset });
  while (!stxBlock) {
    const blockListResponse = await blocksApi.getBlockList({ offset, limit });
    const blocks = blockListResponse.results;
    stxBlock = blocks.find(b => b.burn_block_height === bitcoinBlockHeight);
    offset -= limit;
    console.log('getStxBlock', { offset });
    if (offset < 0 || blocks[blocks.length - 1].burn_block_height > bitcoinBlockHeight)
      return undefined;
  }
  return stxBlock;
}

export async function paramsFromTx(btcTxId, stxHeight) {
  console.log(btcTxId);
  const tx = await (
    await fetch(
      //`https://chain.so/api/v2/tx/btc/${btcTxId}`
      `https://api.blockcypher.com/v1/btc/main/txs/${btcTxId}?includeHex=true`
    )
  ).json();

  if (!tx.hex) {
    console.log(tx);
    return {
      txCV: undefined,
      proofCV: undefined,
      block: undefined,
      blockCV: undefined,
      headerPartsCV: undefined,
      header: undefined,
      headerParts: undefined,
      stxHeight: undefined,
      txPartsCV: undefined,
      error: ERR_API_FAILURE,
    };
  }

  /*
        tx.hex = tx.tx_hex;
        */

  // tx hex without witness
  const txCV = bufferCV(MerkleTree.bufferify(txForHash(tx.hex)));

  let version;
  if (tx.hex.substr(9, 10) === '00') {
    version = tx.hex.substr(0, 12);
  } else {
    version = tx.hex.substr(0, 8);
  }

  // tx decomposed
  const txPartsCV = tupleCV({
    version: bufferCV(Buffer.from(version, 'hex')),
    ins: listCV(
      tx.inputs.map(input => {
        /*
                                input.prev_hash = input.received_from.txid;
                                input.output_index = input.received_from.output_no;
                                input.script = input.script_hex;
                                input.sequence = 123;
                                */
        switch (input.script_type) {
          case 'pay-to-witness-pubkey-hash':
          case 'pay-to-pubkey-hash':
          default:
            return tupleCV({
              outpoint: tupleCV({
                hash: bufferCV(reverse(Buffer.from(input.prev_hash, 'hex'))),
                index: bufferCV(numberToBuffer(input.output_index, 4)),
              }),
              scriptSig: bufferCV(Buffer.from(input.script, 'hex')),
              sequence: bufferCV(numberToBuffer(input.sequence, 4)),
            });
        }
      })
    ),
    outs: listCV(
      tx.outputs.map(output =>
        tupleCV({
          scriptPubKey: bufferCV(Buffer.from(output.script, 'hex')),
          value: bufferCV(numberToBuffer(output.value, 8)),
        })
      )
    ),
    locktime: bufferCV(Buffer.from(tx.hex.substr(tx.hex.length - 8), 'hex')),
  });
  const txHexResponse = await concatTransaction(txPartsCV);
  if (
    txHexResponse.type === ClarityType.OptionalNone ||
    txHexResponse.buffer.toString('hex') !== tx.hex
  ) {
    console.log({ err: cvToString(txHexResponse) });
    return {
      txCV: undefined,
      proofCV: undefined,
      block: undefined,
      blockCV: undefined,
      headerPartsCV: undefined,
      header: undefined,
      headerParts: undefined,
      stxHeight: undefined,
      txPartsCV: undefined,
      error: ERR_DIFFERENT_HEX,
    };
  }

  let height;
  let stacksBlock;
  if (!stxHeight) {
    console.log('try to find stx height');
    const bitcoinBlockHeight = tx.block_height;
    stacksBlock = await getStxBlock(bitcoinBlockHeight);
    if (!stacksBlock) {
      return {
        txCV: undefined,
        proofCV: undefined,
        block: undefined,
        blockCV: undefined,
        headerPartsCV: undefined,
        header: undefined,
        headerParts: undefined,
        stxHeight: undefined,
        txPartsCV: undefined,
        error: ERR_NO_STACKS_BLOCK,
      };
    }
    height = stacksBlock.height;
  } else {
    const stacksBlockResponse = await fetch(
      `https://stacks-node-api.mainnet.stacks.co/extended/v1/block/by_height/${stxHeight}`
    );
    stacksBlock = await stacksBlockResponse.json();
    height = stxHeight;
  }
  console.log({ height, stacksBlockHash: stacksBlock.hash });

  const blockResponse = await fetch(
    `https://api.blockcypher.com/v1/btc/main/blocks/${tx.block_hash}?limit=500`
  );
  const blockFirstPart = await blockResponse.json();
  const txCount = blockFirstPart.n_tx;
  let block = blockFirstPart;
  while (block.txids.length < txCount) {
    const response = await fetch(
      `https://api.blockcypher.com/v1/btc/main/blocks/${tx.block_hash}?limit=500&txstart=${block.txids.length}`
    );
    const blockNextPart = await response.json();
    block.txids = block.txids.concat(blockNextPart.txids);
    console.log({ txidsLength: block.txids.length });
  }

  const headerResponse = await fetch(`https://blockstream.info/api/block/${tx.block_hash}/header`);
  const header = await headerResponse.text();

  // proof cv
  const txIndex = block.txids.findIndex(id => id === btcTxId);
  const tree = new MerkleTree(block.txids, SHA256, { isBitcoinTree: true });
  const treeDepth = tree.getDepth();
  const proof = tree.getProof(btcTxId, txIndex);
  const proofCV = tupleCV({
    'tx-index': uintCV(txIndex),
    hashes: listCV(proof.map(po => bufferCV(reverse(po.data)))),
    'tree-depth': uintCV(treeDepth),
  });
  // block header
  const blockCV = tupleCV({
    header: bufferCV(Buffer.from(header, 'hex')),
    height: uintCV(height),
  });

  // block parts
  const headerParts = [
    header.substr(0, 8),
    header.substr(8, 64),
    header.substr(72, 64),
    header.substr(136, 8),
    header.substr(144, 8),
    header.substr(152, 8),
  ];

  const headerPartsCV = tupleCV({
    version: bufferCV(Buffer.from(headerParts[0], 'hex')),
    parent: bufferCV(Buffer.from(headerParts[1], 'hex')),
    'merkle-root': bufferCV(Buffer.from(headerParts[2], 'hex')),
    timestamp: bufferCV(Buffer.from(headerParts[3], 'hex')),
    nbits: bufferCV(Buffer.from(headerParts[4], 'hex')),
    nonce: bufferCV(Buffer.from(headerParts[5], 'hex')),
    height: uintCV(height),
  });
  return {
    txCV,
    txPartsCV,
    proofCV,
    block,
    blockCV,
    header,
    headerParts,
    headerPartsCV,
    stacksBlock,
    stxHeight: height,
  };
}

export function btcAddressToPubscriptCV(btcAddress) {
  return bufferCV(decodeBase58Address(sha256, btcAddress));
}

export function pubscriptCVToBtcAddress(pubscriptCV) {
  return encodeBase58AddressFormat(sha256, pubscriptCV.buffer);
}

export function stxAddressFromBtcAddress(btcAddress) {
  try {
    return b58ToC32(btcAddress);
  } catch (e) {
    return '-------';
  }
}
