<script setup lang="ts">
import Vue3OTP from './components/Vue3-OTP.vue';
import {ref, unref} from "vue";

const bindValue = ref("");

const handleOnComplete = (value: string) => {
  console.log("completed: ", value);
  console.log("v-model:value: ", unref(bindValue));
};

const handleOnChange = (value: string) => {
  console.log("changed: ", value);
  console.log("v-model ", unref(bindValue));
};
</script>

<template>
  <div class="flex flex-row">
    <Vue3OTP input-classes="otp-input"
             separator="-"
             inputType="letter-numeric"
             :num-inputs="6"
             v-model:value="bindValue"
             :autoFocusEnabled="true"
             :should-focus-order="true"
             @on-change="handleOnChange"
             @on-complete="handleOnComplete"
             :placeholders="['1', '2', '3', '4', '5', '6']"
             @update:value="bindValue = $event">

    </Vue3OTP>
  </div>
</template>

