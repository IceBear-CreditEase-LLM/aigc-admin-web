<template>
  <v-chip :color="state.color" label size="small"> {{ state.label }} </v-chip>
</template>
<script setup>
import { reactive, toRefs, ref, watchEffect } from "vue";
const state = reactive({
  label: "",
  color: ""
});

const { style, formData } = toRefs(state);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default() {
      return false;
    }
  }
});

watchEffect(() => {
  let { modelValue } = props;
  if (modelValue) {
    state.label = "是";
    state.color = "success";
  } else {
    state.label = "否";
    state.color = "default";
  }
});
</script>
<style lang="scss"></style>
