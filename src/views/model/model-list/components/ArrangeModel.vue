<template>
  <Pane ref="refPane" class="" @submit="onSubmit">
    <div class="mx-auto mt-10" style="width: 500px">
      <v-form ref="refForm" class="my-form">
        <v-text-field hide-details="auto" v-model="state.modelName" :disabled="true">
          <template #prepend> <label class="required">模型名称</label></template>
        </v-text-field>
        <v-text-field
          type="number"
          hide-details="auto"
          placeholder="请输入使用实例数量"
          :rules="rules.replicas"
          v-model.number="formData.replicas"
          @input="validNumberInput(formData.replicas, 1, 8, '请输入实例数量', true)"
          max="8"
        >
          <template #prepend>
            <label class="required">实例数 <Explain>启动实例数量</Explain></label></template
          >
        </v-text-field>
        <Select
          hide-details="auto"
          placeholder="请选择调度标签"
          :rules="rules.label"
          :mapDictionary="{ code: 'model_deploy_label' }"
          v-model="formData.label"
        >
          <template #prepend>
            <label class="required">调度标签 <Explain>设置实例调度的节点亲和性</Explain></label>
          </template>
        </Select>
        <v-text-field
          hide-details="auto"
          type="number"
          placeholder="请输入使用GPU数量"
          :rules="rules.gpu"
          v-model.number="formData.gpu"
          @input="validNumberInput(formData.gpu, 1, 8, '请输入GPU数量', true)"
          max="8"
        >
          <template #prepend>
            <label class="required">GPU数量 <Explain>单实例GPU数量</Explain></label></template
          >
        </v-text-field>
        <v-checkbox hide-details="auto" label="开启量化" v-model="state.isQuantify" @change="checkQuantity">
          <template #prepend>
            <label>量化 <Explain>对模型启动进行量化，节约显存提升推理速度</Explain></label>
          </template>
        </v-checkbox>
        <Select
          v-show="state.isQuantify"
          placeholder="请选择精度"
          :mapDictionary="{ code: 'model_deploy_quantization' }"
          v-model="formData.quantization"
          style="margin-top: -14px"
        >
          <template #prepend>
            <label> </label>
          </template>
        </Select>

        <v-checkbox style="margin-top: -14px" hide-details="auto" label="开启VLLM" v-model="formData.vllm">
          <template #prepend>
            <label>VLLM <Explain>如果想要高吞吐量批量处理，您可以尝试开启，开启后会占用gpu的所有显存容量</Explain></label>
          </template>
        </v-checkbox>
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
const regNum = /^\+?[1-9][0-9]*$/;
const state = reactive<{
  // formData: ItfModel;
  /** 操作类型 add 添加  、 edit 编辑 ，默认add */
  operateType: "";
  id: any;
  [x: string]: any;
}>({
  operateType: "",
  maxTokens: 500000,
  id: "",
  modelName: "",
  isQuantify: false,
  formData: {
    replicas: "",
    label: "",
    gpu: "",
    quantization: "",
    vllm: ""
  }
});
const { formData, id } = toRefs(state);

const emits = defineEmits(["submit"]);

const refPane = ref();
const refForm = ref();
const validNumberInput = (value, min, max, errorMessage, reg = false) => {
  if (value !== "") {
    if (value < min) {
      return `下限 ${min}`;
    } else if (value > max) {
      return `上限 ${max}`;
    } else if (reg && regNum.test(value) != true) {
      return "请输入正整数";
    } else {
      return true;
    }
  } else {
    return errorMessage;
  }
};
const rules = reactive({
  replicas: [v => validNumberInput(v, 1, 8, "请输入实例数量", true)],
  label: [v => !!v || "请选择调度标签"],
  gpu: [v => validNumberInput(v, 1, 8, "请输入GPU数量", true)],
  quantization: [v => !!v || "请选择精度"],
  isQuantify: [
    value => {
      if (value && value != false) {
        return true;
      } else {
        return "请开启量化";
      }
    }
  ],
  vllm: [
    value => {
      if (value && value != false) {
        return true;
      } else {
        return "请开启VLLM";
      }
    }
  ]
});

const checkQuantity = async (options = {}) => {
  state.formData.quantization = state.isQuantify ? "float16" : "";
};
const onSubmit = async ({ valid, showLoading }) => {
  if (valid) {
    const [err, res] = await http.post({
      ...showLoading,
      showSuccess: true,
      url: `/api/models/${state.id}/deploy`,
      data: {
        ...state.formData
      }
    });
    if (res) {
      refPane.value.hide();
      emits("submit");
    }
  }
};

defineExpose({
  show({
    title,
    infos = {
      id: "",
      modelName: ""
    },
    operateType
  }) {
    refPane.value.show({
      title,
      refForm
    });
    state.formData = _.pick(_.cloneDeep(infos), []);
    state.operateType = operateType;
    state.modelName = infos.modelName;
    state.id = infos.id;
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
