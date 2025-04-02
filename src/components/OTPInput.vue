<script lang="ts">
import type {InputMode, InputType} from "../core/types.ts";


export interface OTPInputProps {
  inputType?: InputType;
  inputMode?: InputMode;
  value: string;
  separator?: string;
  focus?: boolean;
  inputClasses: string | string[];
  conditionalClass?: string | string[];
  autoFocusEnabled?: boolean;
  placeholder?: string;
  isDisabled?: boolean;
  isLastChild?: boolean;
}
</script>
<script setup lang="ts">
import {computed, onMounted, type Ref, ref, watch} from "vue";

const props = withDefaults(defineProps<OTPInputProps>(), {
  inputType: "tel",
  inputMode: "numeric",
  separator: "",
  focus: false,
  inputClasses: "",
  conditionalClass: "",
  autoFocusEnabled: false,
  isLastChild: false,
  placeholder: "",
  isDisabled: false,
  value: "",
});

const emit = defineEmits<{
  (e: "on-change", value: string | number): void;
  (e: "on-keydown", event: KeyboardEvent): void;
  (e: "on-paste", event: ClipboardEvent): void;
  (e: "on-focus"): void;
  (e: "on-blur"): void;
}>();

watch(
    () => props.value,
    (newValue, oldValue) => {
      if (newValue !== oldValue) {
        model.value = newValue;
      }
    }
);

onMounted(() => {
  if (input.value && props.focus && props.autoFocusEnabled) {
    input.value.focus();
    input.value.select();
  }
});

const model = ref(props.value || "");
const input = ref<HTMLInputElement | null>(null) as Ref<HTMLInputElement>;
const allowedCharCodes = [8, 9, 13, 37, 39, 46, 86];

const isCodeLetter = (charCode: number) => charCode >= 65 && charCode <= 90;
const isCodeNumeric = (charCode: number) =>
    (charCode >= 48 && charCode <= 57) || (charCode >= 96 && charCode <= 105);


const handleOnKeyDown = (event: KeyboardEvent) => {
  if (props.isDisabled) {
    event.preventDefault();
  }
  const keyEvent = event || window.event;
  const charCode = keyEvent.which ? keyEvent.which : keyEvent.keyCode;
  if (
      isCodeNumeric(charCode) ||
      (props.inputType === "letter-numeric" && isCodeLetter(charCode)) ||
      allowedCharCodes.includes(charCode)
  ) {
    emit("on-keydown", event);
  } else {
    keyEvent.preventDefault();
  }
};

const handleOnChange = (e: Event) => {
  const inputElement = e.target as HTMLInputElement;
  const value = inputElement.value;
  if (value && value.trim().length > 1) {
    // Create a new clipboardData object to mimic the clipboardData behavior
    const customClipboardData = {
      getData: () => value.trim(),
    };

    const customEvent = {
      ...e,
      clipboardData: customClipboardData as any,
    } as ClipboardEvent;

    return emit("on-paste", customEvent);
  }
  return emit("on-change", value);
};

const handleOnPaste = (event: ClipboardEvent) => emit("on-paste", event);


const handleOnFocus = () => {
  input.value.select();
  return emit("on-focus");
};

const handleOnBlur = () => emit("on-blur");

const inputTypeValue = computed(() =>
    ["letter-numeric", "number"].includes(props.inputType)
        ? "text"
        : props.inputType
);

watch(
    () => props.focus,
    (newFocusValue, oldFocusValue) => {
      if (oldFocusValue !== newFocusValue && input.value && props.focus) {
        input.value.focus();
        input.value.select();
      }
    }
);
</script>

<template>
  <div class="flex items-center">
    <input :type="inputTypeValue"
           :inputmode="inputMode"
           :placeholder="placeholder"
           :disabled="isDisabled"
           min="0"
           max="9"
           :maxlength="isLastChild ? 1 : undefined"
           :value="model"
           pattern="[0-9]"
           :class="[inputClasses, conditionalClass, { 'is-complete': model }]"
           @input="handleOnChange"
           @keydown="handleOnKeyDown"
           @paste="handleOnPaste"
           @focus="handleOnFocus"
           @blur="handleOnBlur"
           ref="input"/>

    <span v-if="!isLastChild && separator">
      <span v-html="separator"></span>
    </span>
  </div>
</template>

<style lang="css"></style>
