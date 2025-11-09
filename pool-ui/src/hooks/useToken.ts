import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { config } from '../lib/contracts';
import { Address, erc20Abi } from 'viem';

export function useTokenBalance(tokenAddress: Address, userAddress: Address | undefined) {
  return useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && !!tokenAddress,
      retry: false,
      retryOnMount: false,
    },
  });
}

export function useTokenAllowance(tokenAddress: Address, owner: Address | undefined, spender: Address) {
  return useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: owner ? [owner, spender] : undefined,
    query: {
      enabled: !!owner && !!tokenAddress && !!spender,
      retry: false,
      retryOnMount: false,
    },
  });
}

export function useApproveToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = (tokenAddress: Address, spender: Address, amount: bigint) => {
    writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender, amount],
    });
  };

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useTokenDecimals(tokenAddress: Address) {
  return useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'decimals',
    query: {
      enabled: !!tokenAddress,
      retry: false, // Don't retry on failure
      retryOnMount: false,
    },
  });
}

export function useTokenSymbol(tokenAddress: Address) {
  return useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'symbol',
    query: {
      enabled: !!tokenAddress,
      retry: false,
      retryOnMount: false,
    },
  });
}

export function useMintToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const mint = (tokenAddress: Address, to: Address, amount: bigint) => {
    // Get the token ABI from config (token0 or token1)
    const tokenAbi = 
      tokenAddress.toLowerCase() === config.contracts.token0.address.toLowerCase()
        ? config.contracts.token0.abi
        : config.contracts.token1.abi;

    writeContract({
      address: tokenAddress,
      abi: tokenAbi,
      functionName: 'mint',
      args: [to, amount],
    });
  };

  return {
    mint,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
