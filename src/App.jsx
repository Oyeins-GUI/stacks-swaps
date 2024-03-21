import Auth from './components/Auth';
import Intro from './pages/Intro';
import LandingCat from './pages/LandingCat';

import { Connect } from '@stacks/connect-react';
import { useEffect } from 'react';
import { ProfileSmall } from './components/ProfileSmall';
import { atomicSwaps } from './lib/constants';
import { useAccount } from './lib/hooks';
import BitcoinMonkeys from './pages/BitcoinMonkeys';
import Landing from './pages/Landing';
import LandingAtomic from './pages/LandingAtomic';
import StacksSwaps from './pages/StacksSwaps';
import Tac from './pages/Tac';
import Arkadiko from './pages/special/Arkadiko';
import BTCSportFlagsBurnMany from './pages/special/BTCSportsFlagsBurnMany';
import BTCSportFlagsTransferMany from './pages/special/BTCSportsFlagsTransferMany';
import Curator from './pages/special/Curator';
import DeploySponsoredContract from './pages/special/DeploySponsoredContract';
import NFTTransfer from './pages/special/NFTTransfer';
import PoolAdmin from './pages/special/PoolAdmin';
import ResendFailedTx from './pages/special/ResendFailedTx';
import UnlistStacksPunks from './pages/special/UnlistStacksPunks';
import { AppContext } from './lib/context';
import { useAuth } from './lib/useAuth';

export default function App() {
  const { authOptions, state } = useAuth();
  return (
    <Connect authOptions={authOptions}>
      <AppContext.Provider value={state}>
        <header className="d-flex flex-wrap justify-content-between align-items-center mx-3 py-3 mb-4 border-bottom">
          <div>
            <a
              href="/"
              className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none"
            >
              <img src="/android-icon-72x72.png" width="75" alt="Catamaran Swaps Logo" />
            </a>
          </div>
          <div className="text-center">
            <span className="h1">Catamaran Swaps</span>
            <br />
            <span className="p">Trustless exchange of digital assets</span>
          </div>
          <div className="btn-group btn-group-lg" role="group" aria-label="Basic outlined example">
            <ProfileSmall />
            <a
              href="https://docs.catamaranswaps.org"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-primary"
            >
              Docs
            </a>
            <Auth />
          </div>
        </header>
        <Content />
      </AppContext.Provider>
    </Connect>
  );
}
function Content() {
  const { stxAddress, decentralizedID } = useAccount();
  const authenticated = !!stxAddress;

  const swap = atomicSwaps[0];
  return (
    <>
      <Router>
        <>
          <Intro path="/" default />
          {authenticated && <Intro path="/atomic" hideCatamaran />}
          {authenticated && <Intro path="/catamaran" hideAtomic />}

          <Tac path="/tac" />
          <BitcoinMonkeys path="/bitcoin-monkeys" />
          <StacksSwaps path="/:swapPath/swap/:id" decentralizedID={decentralizedID} />
          <StacksSwaps
            path="/:swapPath/:trait/:nftId"
            type={swap.type}
            decentralizedID={decentralizedID}
            trait={swap.trait}
          />
          <StacksSwaps
            path="/:swapPath/:trait/"
            type={swap.type}
            decentralizedID={decentralizedID}
            trait={swap.trait}
          />
          <StacksSwaps path="/:swapPath" decentralizedID={decentralizedID} />

          {authenticated && <UnlistStacksPunks path="/unlist-stacks-punks" />}
          {authenticated && <Curator path="/curator" />}
          <NFTTransfer path="/nft-transfer" />
          <ResendFailedTx path="/resend" />
          <PoolAdmin path="/pool-admin" />
          <BTCSportFlagsTransferMany path="/btc-sports-flags-transfer-many/:receiver" />
          <BTCSportFlagsTransferMany path="/btc-sports-flags-transfer-many" />
          <BTCSportFlagsBurnMany path="/btc-sports-flags-burn-many" />
          <Arkadiko path="/arkadiko" />
          <DeploySponsoredContract path="/deploy-sponsored-contract" />
        </>
        {!authenticated && <Landing path="/" exact default />}
        {!authenticated && <LandingCat path="/catamaran" />}
        {!authenticated && <LandingAtomic path="/atomic" />}
      </Router>
    </>
  );
}
