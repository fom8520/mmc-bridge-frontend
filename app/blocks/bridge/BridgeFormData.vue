<script setup lang="ts">
import { ethers } from 'ethers';
import { toast } from 'vue-sonner';
import { number, object, string, ValidationError } from 'yup';
import { SolanaWalletController } from '~/utils/solana-wallets';
import { formatAmount, cn } from '~/utils/helpers';

const {
  recipient,
  amount,
  fromChain,
  toChain,
  fromToken,
  chains,
  getBalance,
  swap,
} = useBridgeRemote();

const { address: mmcAddress, rpcApi } = useMMCWallet();
const { address: solanaAddress } = useSolanaWallet();
const { address: evmAddress } = useEvmWallet();

const formRef = useTemplateRef('form');

const { data: tokenBalance, status: balanceStatus } = useAsyncData(
  'bridge:token-balance',
  () => {
    return getBalance();
  },
  {
    server: false,
    watch: [fromChain, fromToken, mmcAddress, solanaAddress],
    deep: true,
  },
);

const connectedWallet = computed(() => {
  const _chain = fromChain.value;
  if (_chain) {
    const walletAddress: { [key: string]: string | null | undefined } = {
      Solana: solanaAddress.value,
      MMC: mmcAddress.value,
      EVM: evmAddress.value,
    };

    return walletAddress[_chain.type];
  }

  return null;
});

const selfAddress = computed(() => {
  const _chain = toChain.value;
  if (_chain) {
    if (_chain.type === 'Solana') {
      return solanaAddress.value;
    } else if (_chain.type === 'MMC') {
      return mmcAddress.value;
    } else if (_chain.type === 'EVM') {
      return evmAddress.value;
    }
  }

  return '';
});

const showSelf = computed(() => {
  return !!selfAddress.value;
});

const formatedAmount = computed(() => {
  if (!fromToken.value) {
    return '0';
  }
  return formatAmount(
    ethers.utils.formatUnits(
      tokenBalance.value || 0n,
      fromToken.value?.decimals,
    ),
    fromToken.value?.decimals,
  );
});

const formValues = computed(() => {
  return {
    recipient: recipient.value,
    amount: amount.value,
    fromChain: fromChain.value?.id,
    toChain: toChain.value?.id,
    fromToken: fromToken.value?.symbol,
  };
});

const recipientPlaceholder = computed(() => {
  if (toChain.value && toChain.value.value === 'solana') {
    return 'iZinzD...';
  }
  return '0x123456...';
});

const schema = computed(() => {
  return object({
    recipient: string()
      .required('Please enter the receiver address')
      .test({
        name: 'recipient',
        test: function (val) {
          if (!val) {
            throw new ValidationError(
              'Please enter a correct receiving address.',
              val,
              this.path,
            );
          }
          const _chainType = toChain.value?.type;
          if (_chainType === 'Solana') {
            if (!SolanaWalletController.isValidSolanaAddress(val)) {
              throw new ValidationError(
                'Please enter the correct Solana recipient address.',
                val,
                this.path,
              );
            }
          } else if (['EVM', 'MMC'].includes(_chainType || '')) {
            if (!ethers.utils.isAddress(val)) {
              throw new ValidationError(
                'Please enter the correct EVM recipient address.',
                val,
                this.path,
              );
            }
          }
          return true;
        },
      }),
    amount: string()
      .required('Please enter the amount.')
      .test({
        name: 'amount',
        test: function (val) {
          const _token = fromToken.value;
          if (val && _token) {
            const _val = ethers.utils
              .parseUnits(val, _token.decimals)
              .toBigInt();
            const _balance = tokenBalance.value || 0n;

            if (_val > _balance) {
              throw new ValidationError('Insufficient balance', val, this.path);
            }
          }
          return true;
        },
      }),
    fromChain: number().required('Please select a chain'),
    toChain: number().required('Please select a chain'),
    fromToken: string().required('Please select a token'),
  });
});

function onChangeChains() {
  const _from = fromChain.value ? { ...fromChain.value } : undefined;
  fromChain.value = toChain.value ? { ...toChain.value } : undefined;
  toChain.value = _from;
  fromToken.value = null;
  recipient.value = '';
  amount.value = '';
}

function onMax() {
  if (!fromToken.value) {
    amount.value = '0';
  }
  amount.value = ethers.utils.formatUnits(
    tokenBalance.value || '0',
    fromToken.value?.decimals,
  );
}

function setSelf() {
  const _chain = toChain.value;

  if (_chain) {
    recipient.value = selfAddress.value || '';

    setTimeout(() => {
      formRef.value?.validate({ name: ['recipient'] });
    }, 500);
  }
}

function onSelectChain(type: 'from' | 'to') {
  useModals().open('SelectChainModal', {
    props: {
      chains: chains.filter((item) => {
        const f = type === 'from' ? toChain.value : fromChain.value;
        if (f?.id === item.id) {
          return false;
        }

        // // the from token is selected
        // if (fromToken.value && type === 'to') {
        //   return item.tokens.some(t => t.symbol === fromToken.value?.symbol);
        // }

        let _chain;
        if (type === 'from') {
          _chain = toChain.value;
        } else {
          _chain = fromChain.value;
        }

        // tokens in common
        return (
          _chain?.tokens.some((c) => {
            const keys = Object.keys(c.contract);
            console.log(keys);
            return keys.includes(item.value);
          }) ?? true
        );
      }),
      selected: type === 'from' ? fromChain.value : toChain.value,
      onSelect: (val) => {
        if (type === 'from') {
          fromChain.value = val;
          amount.value = '';
        } else {
          toChain.value = val;
          recipient.value = '';
        }
        fromToken.value = null;
      },
    },
  });
}

function onToken() {
  const _tokens = (fromChain.value?.tokens || []).filter((item) => {
    if (toChain.value) {
      return toChain.value.tokens.some(t => t.symbol === item.symbol);
    }
    return false;
  });

  useModals().open('SelectTokenModal', {
    props: {
      tokens: _tokens,
      selected: fromToken.value,
      onSelect: (val) => {
        fromToken.value = val;
        setTimeout(() => {
          formRef.value?.validate({ name: ['fromToken'] });
        }, 500);
      },
    },
  });
}

const swapping = ref(false);
async function onSwap() {
  try {
    swapping.value = true;
    await formRef.value?.submit();
    const res = await swap();
    console.log(res);

    toast.success('Sent successfully.');
    amount.value = '';
    recipient.value = '';
  } catch (err) {
    if (err instanceof Error) {
      toast.error(err.message);
    }
  } finally {
    swapping.value = false;
  }
}

watch(tokenBalance, () => {
  if (fromToken.value) {
    formRef.value?.validate({ name: ['amount'] });
  }
});

onMounted(() => {
  rpcApi.call('GetBlockByHeight', {
    params: {
      beginHeight: '1',
      endHeight: '2',
    },
  }).then((res) => {
    console.log(res);
  });
});
</script>

<template>
  <div class="w-full ring-1 ring-primary/30 rounded-md bg-secondary-950/80">
    <div class="w-full px-1.5 py-3.5">
      <UForm
        ref="form"
        :state="formValues"
        :schema="schema"
      >
        <div class="w-full flex justify-between items-center space-x-6">
          <UFormField
            name="fromChain"
            class="w-2/5"
          >
            <div
              class="flex items-center cursor-pointer border-b border-primary-800 py-2"
              @click="onSelectChain('from')"
            >
              <UAvatar
                :key="fromChain?.icon + 'from'"
                :src="fromChain?.icon"
                :alt="fromChain?.label"
                :size="'sm'"
                :ui="{
                  image: 'object-contain rounded-none',
                  root: cn('p-0.5', fromChain?.icon ? ' bg-transparent' : ''),
                }"
              />
              <div class="grow flex flex-col pl-3 pr-5 overflow-hidden">
                <span class="text-elevated text-xs">From</span>
                <span class="truncate text-base text-primary">{{
                  fromChain?.label || 'Select chain'
                }}</span>
              </div>
              <div class="pr-2">
                <UIcon
                  name="grommet-icons:down"
                  class="text-xs text-elevated"
                />
              </div>
            </div>
          </UFormField>

          <div class="flex items-center justify-center">
            <span
              class="flex cursor-pointer"
              @click="onChangeChains"
            >
              <UIcon
                name="i-custom-swap"
                class="text-primary w-5 h-5"
              />
            </span>
          </div>
          <UFormField
            name="toChain"
            class="w-2/5"
          >
            <div
              class="flex items-center cursor-pointer border-b border-primary-800 py-2"
              @click="onSelectChain('to')"
            >
              <UAvatar
                :key="toChain?.icon + 'to'"
                :src="toChain?.icon"
                :alt="toChain?.label"
                :size="'sm'"
                :ui="{
                  image: 'object-contain rounded-none',
                  root: cn('p-0.5', toChain?.icon ? ' bg-transparent' : ''),
                }"
              />
              <div class="grow flex flex-col pl-3 pr-5 overflow-hidden">
                <span class="text-elevated text-xs">To</span>
                <span class="truncate text-base text-primary">
                  {{ toChain?.label || 'Select chain' }}
                </span>
              </div>
              <div class="pr-2">
                <UIcon
                  name="grommet-icons:down"
                  class="text-xs text-elevated"
                />
              </div>
            </div>
          </UFormField>
        </div>

        <div class="w-full flex pt-6">
          <UFormField
            label="Token"
            size="xl"
            name="fromToken"
            class="w-1/2 pr-1.5"
          >
            <UInput
              :model-value="fromToken?.symbol"
              placeholder="Select Token"
              :ui="{
                trailing: '!pe-3',
                base: fromToken ? 'pl-10' : 'pl-3',
              }"
              class="w-full"
              @click="onToken"
            >
              <template #leading>
                <span
                  v-if="fromToken"
                  class="flex"
                >
                  <UAvatar
                    :key="fromToken?.icon + 'token'"
                    :src="fromToken?.icon"
                    :alt="fromToken?.symbol"
                    :size="'2xs'"
                    :ui="{
                      image: ' object-contain',
                      root: cn(
                        'p-0.5',
                        fromToken?.icon ? ' bg-transparent' : '',
                      ),
                    }"
                  />
                </span>
              </template>
              <template #trailing>
                <span>
                  <UIcon
                    name="grommet-icons:down"
                    class="text-xs text-elevated"
                  />
                </span>
              </template>
            </UInput>
          </UFormField>

          <UFormField
            label="Amount"
            size="xl"
            name="amount"
            class="w-1/2 pl-1.5"
          >
            <template #hint>
              <div class="text-xs font-normal leading-4">
                <span>{{ `My balance：` }}</span>
                <span v-if="balanceStatus === 'pending'">
                  <USkeleton class="h-2 w-10 inline-block" />
                </span>
                <template v-else>
                  <span>{{ formatedAmount }}</span>
                  <span
                    v-if="fromToken"
                    class="text-[10px] leading-4"
                  >
                    {{ ` ${fromToken?.symbol || ''}` }}
                  </span>
                </template>
              </div>
            </template>
            <CustomInput
              v-model:model-value="amount"
              :min="0"
              :precision="6"
              :type="'number'"
              placeholder="0.00"
              class="w-full"
            >
              <template #trailing>
                <UButton
                  :ui="{ base: ' rounded-[4px]' }"
                  @click="onMax"
                >
                  <span>Max</span>
                </UButton>
              </template>
            </CustomInput>
          </UFormField>
        </div>

        <UFormField
          label="Recipient address"
          size="xl"
          class="pt-3.5"
          name="recipient"
        >
          <template #hint>
            <span>{{ `Remote balance：${0} ` }}</span>
          </template>
          <UInput
            v-model:model-value="recipient"
            :placeholder="recipientPlaceholder"
            class="w-full"
          >
            <template #trailing>
              <UButton
                v-if="showSelf"
                :ui="{ base: ' rounded-[4px]' }"
                @click="setSelf"
              >
                <span>Self</span>
              </UButton>
            </template>
          </UInput>
        </UFormField>
      </UForm>

      <div class="w-full pt-6 mt-0.5 flex justify-center">
        <div class="w-2/3">
          <ConnectWallet
            v-if="!connectedWallet"
            class="w-full"
            :size="'large'"
          />
          <PrimaryButton
            v-else
            :loading="swapping"
            class="w-full"
            size="large"
            @click="onSwap"
          >
            <span>Swap</span>
          </PrimaryButton>
        </div>
      </div>
    </div>
  </div>
</template>
