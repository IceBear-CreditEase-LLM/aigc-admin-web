<template>
  <Pane ref="refPane" class="" @submit="onSubmit">
    <div class="mx-auto mt-10" style="width: 500px">
      <!-- formData :{{ formData }} -->
      <v-form ref="refForm" class="my-form">
        <v-text-field
          density="compact"
          variant="outlined"
          type="text"
          placeholder="只允许字母、数字、“-” 、“.” 和 “:” "
          hide-details="auto"
          clearable
          :rules="rules.modelName"
          v-model="formData.modelName"
          :disabled="state.disabledField"
        >
          <template #prepend> <label class="required">模型名称</label></template>
        </v-text-field>
        <v-text-field
          density="compact"
          variant="outlined"
          type="number"
          :placeholder="'上限 ' + format.commaString(state.maxTokens)"
          hide-details="auto"
          :rules="rules.maxTokens"
          v-model.number="formData.maxTokens"
        >
          <template #prepend> <label class="required">最长上下文</label></template>
        </v-text-field>
        <Select
          placeholder="请选择供应商"
          :rules="rules.providerName"
          :mapDictionary="{ code: 'model_provider_name' }"
          v-model="formData.providerName"
          :disabled="state.disabledField"
        >
          <template #prepend>
            <label class="required">供应 <Explain>供应商指的是外部服务提供，自己有服务请选择Local</Explain></label>
          </template>
        </Select>
        <v-switch v-model="formData.isPrivate" :disabled="state.disabledField" color="primary" hide-details="auto">
          <template #prepend>
            <label>私有 <Explain>私有模型，表示部署在本地服务器，如果是请打开</Explain></label>
          </template>
        </v-switch>
        <v-switch v-model="formData.isFineTuning" :disabled="state.disabledField" color="primary" hide-details="auto">
          <template #prepend>
            <label>微调 <Explain>是否是微调模型</Explain></label>
          </template>
        </v-switch>
        <v-switch v-model="formData.enabled" color="primary" hide-details="auto">
          <template #prepend>
            <label>启用 <Explain>模型是否可被使用，如果关闭则无法使用该模型</Explain></label></template
          >
        </v-switch>
        <v-text-field
          v-if="formData.isPrivate"
          density="compact"
          variant="outlined"
          type="number"
          placeholder="请输入参数量"
          hide-details="auto"
          v-model.number="formData.parameters"
          style="width: 60%"
          :disabled="state.disabledField"
        >
          <template #prepend>
            <label class="required" style="width: 100%">参数量(B) <Explain>单位是B，代理10亿</Explain></label>
          </template>
        </v-text-field>

        <v-textarea v-model.trim="formData.remark" placeholder="请输入">
          <template #prepend> <label>备注</label></template>
        </v-textarea>
      </v-form>
    </div>
  </Pane>
</template>
<script setup lang="ts">
import { reactive, toRefs, ref, nextTick } from "vue";
import _ from "lodash";
import Explain from "@/components/ui/Explain.vue";
import { http, validator, format } from "@/utils";
import { ItfModel } from "../types/modelList.ts";

const state = reactive<{
  formData: ItfModel;
  /** 操作类型 add 添加  、 edit 编辑 ，默认add */
  operateType: "add" | "edit";
  [x: string]: any;
}>({
  operateType: "add",
  disabledField: false,
  maxTokens: 500000,
  formData: {
    id: "",
    modelName: "",
    maxTokens: 0,
    isPrivate: false,
    isFineTuning: false,
    enabled: true,
    remark: "",
    parameters: 0,
    providerName: ""
  }
});
const { formData } = toRefs(state);

const emits = defineEmits(["submit"]);

const refPane = ref();
const refForm = ref();
const rules = reactive({
  modelName: [
    value => {
      return validator.isModelName({ value, required: true });
    }
  ],
  maxTokens: [
    value => {
      if (value !== "") {
        if (value < 1) {
          return "下限 1";
        } else if (value > state.maxTokens) {
          return "上限 " + format.commaString(state.maxTokens);
        } else {
          return true;
        }
      } else {
        return "请输入模型最长上下文";
      }
    }
  ],
  providerName: [
    value => {
      if (value && value.length > 0) {
        return true;
      } else {
        return "请选择供应";
      }
    }
  ]
});

const doAdd = async (options = {}) => {
  const [err, res] = await http.post({
    ...options,
    showSuccess: true,
    url: `/models`,
    data: {
      ...state.formData
    }
  });
  if (res) {
    refPane.value.hide();
    emits("submit");
  }
};

const doEdit = async (options = {}) => {
  const [err, res] = await http.put({
    ...options,
    showSuccess: true,
    url: `/models/${state.formData.id}`,
    data: {
      ...state.formData
    }
  });
  if (res) {
    refPane.value.hide();
    emits("submit");
  }
};

const onSubmit = ({ valid, showLoading }) => {
  if (valid) {
    if (state.operateType == "add") {
      doAdd({ showLoading });
    } else {
      doEdit({ showLoading });
    }
  }
};

defineExpose({
  show({
    title,
    infos = {
      id: "",
      modelName: "",
      maxTokens: 0,
      isPrivate: false,
      isFineTuning: false,
      enabled: true,
      remark: "",
      providerName: "",
      parameters: 0
    },
    operateType
  }) {
    refPane.value.show({
      title,
      refForm
    });
    state.formData = _.pick(_.cloneDeep(infos), [
      "id",
      "modelName",
      "maxTokens",
      "isPrivate",
      "isFineTuning",
      "enabled",
      "remark",
      "providerName",
      "parameters"
    ]);
    state.operateType = operateType;
    if (operateType == "add") {
      //添加
      state.disabledField = false;
    } else {
      //编辑
      state.disabledField = true;
    }
  }
});
</script>
<style lang="scss" scoped>
label {
  width: 100px;
  text-align: right;
  .compo-explain {
    margin-top: 1px;
  }
}
</style>
