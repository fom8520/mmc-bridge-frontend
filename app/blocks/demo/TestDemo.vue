<script setup lang="ts">
import { toast } from 'vue-sonner';

const { address, provider } = useMMCWallet();

const confirming = ref(false);
async function transfer() {
  try {
    confirming.value = true;
    const res = await provider.sendTransaction({
      method: 'CreateTransaction',
      data: {
        method: 'CreateTransaction',
        gasTrade: {
          gasFromAddr: address.value!,
          gasType: '0x5b0a968d45eb5e13318e4580dcff1d44f945c3cd299f1d38612cf46f71920d07',
        },
        params: {
          isFindUtxo: false,
          isGasTrade: true,
          txInfo: '',
          sleeptime: '3',
        },
        txAsset: [
          {
            assetType: '0x5b0a968d45eb5e13318e4580dcff1d44f945c3cd299f1d38612cf46f71920d07',
            fromAddr: [
              address.value!,
            ],
            toAddrAmount: [
              {
                addr: '0x8005986884408f21b26d0E424869c3ED6106B85B',
                value: 100,
              },
            ],
          },
        ],
      },
    });

    console.log(res);
    toast.success('Transfer success');
  } catch (err) {
    if (err instanceof Error) {
      toast.error(err.message);
    }
  } finally {
    confirming.value = false;
  }
}
</script>

<template>
  <div class="w-full grid  grid-cols-1 gap-3">
    <!-- <UCard>
      <template #header>
        <span>Solana Wallet</span>
      </template>
      <SolanaWalletMenu />
    </UCard> -->
    <UCard>
      <template #header>
        <span>MMC Wallet</span>
      </template>
      <div class=" space-y-3">
        <ConnectMMCWalletButton />

        <MMCDataDemo />

        <UButton
          :loading="confirming"
          @click="transfer"
        >
          Transfer MMC
        </UButton>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <span>Bridge</span>
      </template>
      <div class=" space-y-3">
        <BridgeDemo />
      </div>
    </UCard>
  </div>
</template>
