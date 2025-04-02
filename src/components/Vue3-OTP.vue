<script lang="ts">
import type {OTPInputProps} from "./OTPInput.vue";

export interface OTPProps extends OTPInputProps {
  placeholders?: string[];
  shouldFocusOrder?: boolean;
  numInputs?: number;
}
</script>

<script setup lang="ts">
import {ref, watch} from "vue";
import {config} from "../config/config.ts";
import OTPInput from "./OTPInput.vue";

const props = withDefaults(defineProps<OTPProps>(), {
  value: "",
  numInputs: 6,
  separator: "",
  inputClasses: "",
  inputMode: "text",
  shouldAutoFocus: false,
});

const emit = defineEmits<{
  (e: "update:value", value: string): void;
  (e: "on-change", value: string): void;
  (e: "on-complete", value: string): void;
}>();

const activeInput = ref<number>(0);
const otp = ref<string[]>([]);
const oldOtp = ref<string[]>([]);

watch(
    () => props.value,
    (val) => {
      if (val.length === props.numInputs || otp.value.length === 0) {
        otp.value = val.split("");
      }
    },
    {immediate: true}
);

const focusInput = (input: number) => {
  activeInput.value = Math.max(Math.min(props.numInputs - 1, input), 0);
};
const focusNextInput = () => {
  focusInput(activeInput.value + 1);
};
const focusPrevInput = () => {
  focusInput(activeInput.value - 1);
};


const checkFilledAllInputs = () => {
  if (otp.value.join("").length === props.numInputs) {
    emit("update:value", otp.value.join(""));
    return emit("on-complete", otp.value.join(""));
  }
  return "Please wait until the user enters the required number of characters.";
};

const changeCodeAtFocus = (value: number | string) => {
  oldOtp.value = Object.assign([], otp.value);

  otp.value[activeInput.value] = value.toString();

  if (oldOtp.value.join("") !== otp.value.join("")) {
    emit("update:value", otp.value.join(""));
    emit("on-change", otp.value.join(""));
    checkFilledAllInputs();
  }
};

const handleOnPaste = (event: any) => {
  event.preventDefault();
  const pastedData = event.clipboardData
      .getData("text/plain")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, props.numInputs - activeInput.value)
      .split("");
  if (props.inputType === "number" && !pastedData.join("").match(/^\d+$/)) {
    return "Data that was pasted is not valid";
  }

  if (
      props.inputType === "letter-numeric" &&
      !pastedData.join("").match(/^\w+$/)
  ) {
    return "Invalid pasted data";
  }
  const currentCharsInOtp = otp.value.slice(0, activeInput.value);
  const combinedWithPastedData = currentCharsInOtp.concat(pastedData);

  combinedWithPastedData.slice(0, props.numInputs).forEach(function (value, i) {
    otp.value[i] = value;
  });

  focusInput(combinedWithPastedData.slice(0, props.numInputs).length);
  return checkFilledAllInputs();
};

const handleOnChange = (value: number | string) => {
  changeCodeAtFocus(value);
  focusNextInput();
};

const handleOnFocus = (index: number) => {
  activeInput.value = index;
};
const handleOnBlur = () => {
  activeInput.value = -1;
};


const clearInput = () => {
  if (otp.value.length > 0) {
    emit("update:value", "");
    emit("on-change", "");
  }
  otp.value = [];
  activeInput.value = 0;
};

const fillInput = (value: string) => {
  const fill = value.split("");
  if (fill.length === props.numInputs) {
    otp.value = fill;
    emit("update:value", otp.value.join(""));
    emit("on-complete", otp.value.join(""));
  }
};

const handleOnKeyDown = (event: KeyboardEvent, index: number) => {
  switch (event.code) {
    case config.BACKSPACE:
      event.preventDefault();
      changeCodeAtFocus("");
      focusPrevInput();
      break;
    case config.DELETE:
      event.preventDefault();
      changeCodeAtFocus("");
      break;
    case config.LEFT_ARROW:
      event.preventDefault();
      focusPrevInput();
      break;
    case config.RIGHT_ARROW:
      event.preventDefault();
      focusNextInput();
      break;
    default:
      focusOrder(index);
      break;
  }
};

const focusOrder = (currentIndex: number) => {
  if (props.shouldFocusOrder) {
    setTimeout(() => {
      const len = otp.value.join("").length;
      if (currentIndex - len >= 0) {
        activeInput.value = len;
        otp.value[currentIndex] = "";
      }
    }, 100);
  }
};

defineExpose({
  clearInput,
  fillInput,
});

</script>

<template>
  <div class="flex">
    <input
        v-if="inputType === 'password'"
        autocomplete="off"
        class="display-none"
        name="hidden"
        type="text"
    />
    <OTPInput v-for="(_, i) in numInputs"
              :key="i"
              :focus="activeInput === i"
              :value="otp[i]"
              :separator="separator"
              :input-type="inputType"
              :input-mode="inputMode"
              :input-classes="inputClasses"
              :conditionalClass="conditionalClass?.[i]"
              :is-last-child="i === numInputs - 1"
              :auto-focus-enabled="autoFocusEnabled"
              :placeholder="placeholders?.[i] ?? ''"
              :is-disabled="isDisabled"
              @on-change="handleOnChange"
              @on-keydown="handleOnKeyDown($event, i)"
              @on-paste="handleOnPaste"
              @on-focus="handleOnFocus(i)"
              @on-blur="handleOnBlur"/>
  </div>
</template>
