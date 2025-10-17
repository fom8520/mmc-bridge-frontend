<script setup lang="ts">
const { recipient, amount, fromChain, toChain, fromToken } = useBridgeRemote();
</script>

<template>
  <div class="w-full ring-1 ring-primary/30 rounded-md bg-secondary-950/80">
    <div class="w-full px-1.5 py-3.5">
      <UForm>
        <UFormField>
          <div class="w-full flex justify-between items-center space-x-6">
            <div class=" w-2/5 flex items-center cursor-pointer border-b border-primary-800 py-2">
              <UAvatar
                :key=" fromChain?.icon + 'from'"
                :src="fromChain?.icon"
              />
              <div class=" grow flex flex-col pl-3 pr-5 overflow-hidden">
                <span class="text-elevated text-xs">From</span>
                <span class=" truncate text-base text-primary">{{ fromChain?.label || 'Select chain' }}</span>
              </div>
              <div class="pr-2">
                <UIcon
                  name="grommet-icons:down"
                  class=" text-xs text-elevated"
                />
              </div>
            </div>
            <div class="flex items-center justify-center ">
              <span class="flex  cursor-pointer">
                <UIcon
                  name="i-custom-swap"
                  class=" text-primary w-5 h-5"
                />
              </span>
            </div>
            <div class=" w-2/5 flex items-center  cursor-pointer border-b border-primary-800 py-2">
              <UAvatar
                :key=" toChain?.icon + 'to'"
                :src="toChain?.icon"
              />
              <div class=" grow flex flex-col pl-3 pr-5 overflow-hidden">
                <span class="text-elevated text-xs">To</span>
                <span class=" truncate text-base text-primary">{{ toChain?.label || 'Select chain' }}</span>
              </div>
              <div class="pr-2">
                <UIcon
                  name="grommet-icons:down"
                  class=" text-xs text-elevated"
                />
              </div>
            </div>
          </div>
        </UFormField>

        <div class="w-full flex justify-between space-x-3 pt-6">
          <UFormField
            label="Token"
            size="xl"
          >
            <UInput
              :model-value="fromToken?.symbol"
              placeholder="Select Token"
              :ui="{
                trailing: '!pe-3',
              }"
            >
              <template #trailing>
                <span>
                  <UIcon
                    name="grommet-icons:down"
                    class=" text-xs text-elevated"
                  />
                </span>
              </template>
            </UInput>
          </UFormField>

          <UFormField
            label="Amount"
            size="xl"
          >
            <template #hint>
              <span>{{ `My balance：${0}` }}</span>
            </template>
            <CustomInput
              v-model:model-value="amount"
              :min="0"
              :type="'number'"
              placeholder="0.00"
            >
              <template #trailing>
                <UButton :ui="{ base: ' rounded-[4px]' }">
                  <span>Max</span>
                </UButton>
              </template>
            </CustomInput>
          </UFormField>
        </div>

        <UFormField
          label="Recipient address"
          size="xl"
          class=" pt-3.5"
        >
          <template #hint>
            <span>{{ `Remote balance：${0}` }}</span>
          </template>
          <UInput
            v-model:model-value="recipient"
            placeholder="0x123456..."
            class="w-full"
          >
            <template #trailing>
              <UButton :ui="{ base: ' rounded-[4px]' }">
                <span>Self</span>
              </UButton>
            </template>
          </UInput>
        </UFormField>
      </UForm>

      <div class="w-full pt-6 mt-0.5 flex justify-center">
        <div class="w-2/3 ">
          <!-- <PrimaryButton>
            <span>Swap</span>
          </PrimaryButton> -->
          <ConnectWallet
            class="w-full"
            :size="'large'"
          />
        </div>
      </div>
    </div>
  </div>
</template>
