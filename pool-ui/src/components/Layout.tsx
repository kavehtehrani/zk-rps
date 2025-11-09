import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { formatAddress } from '../lib/utils';
import config from '../../deployments.json';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const expectedChainId = parseInt(config.chainId);
  const isCorrectNetwork = chainId === expectedChainId;

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/swap', label: 'Swap & Play' },
    { path: '/games', label: 'My Games' },
    { path: '/pool', label: 'Pool Stats' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold text-white">
                🎮 Raffle Pool
              </Link>
              <nav className="hidden md:flex space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {!isCorrectNetwork && isConnected && (
                <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500 rounded text-xs text-yellow-400">
                  Wrong Network (Chain ID: {chainId})
                </div>
              )}
              {isConnected && address ? (
                <>
                  <span className="text-sm text-slate-300">
                    {formatAddress(address)}
                  </span>
                  <button
                    onClick={() => disconnect()}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={() => connect({ connector: connectors[0] })}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      {!isCorrectNetwork && isConnected && (
        <div className="bg-yellow-500/20 border-b border-yellow-500">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-yellow-400 text-sm">
                <strong>⚠️ Wrong Network:</strong> Please switch to Local Anvil (Chain ID: {expectedChainId}) at {config.rpcUrl}
              </div>
              <div className="text-xs text-yellow-300 space-y-1">
                <div><strong>Network Name:</strong> Local Anvil</div>
                <div><strong>RPC URL:</strong> {config.rpcUrl}</div>
                <div><strong>Chain ID:</strong> {expectedChainId}</div>
                <div><strong>Currency Symbol:</strong> ETH</div>
              </div>
            </div>
          </div>
        </div>
      )}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
