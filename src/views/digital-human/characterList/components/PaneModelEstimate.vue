<template>
  <Pane ref="refPane" class="" @submit="onSubmit">
    <div class="mx-auto mt-10" style="width: 500px">
      <v-form ref="refForm" class="my-form">
        <v-input :rules="rules.coverFileId" v-model="formData.coverFileId" hide-details="auto" style="position: relative">
          <template v-if="headImgInfos && headImgInfos.s3Url">
            <v-alert color="borderColor" variant="text" density="compact" style="flex: none">
              <v-avatar size="80" rounded="0">
                <v-img :transition="false" :src="headImgInfos.s3Url" alt="上传成功后的头像" cover />
              </v-avatar>
              <template #close v-if="!state.disabledVal">
                <v-icon class="text-24 opacity-50 cursor-pointer" color="textPrimary" @click="headImgClose"
                  >mdi-close-circle</v-icon
                >
              </template>
            </v-alert>
          </template>
          <template v-else>
            <v-btn color="info" variant="outlined" prepend-icon="mdi-plus" stacked
              >上传
              <UploadFile
                accept="image/*"
                v-model="formData.coverFileId"
                v-model:infos="headImgInfos"
                style="width: 114px; height: 102px; position: absolute; top: 0; left: -55%; opacity: 0"
              />
            </v-btn>
          </template>
          <template #prepend> <label class="required">预览图片</label></template>
        </v-input>
        <v-input
          :rules="rules.videoFileId"
          v-model="formData.videoFileId"
          hide-details="auto"
          style="position: relative; width: 100%"
        >
          <template v-if="headVideoInfos && headVideoInfos.s3Url">
            <v-alert color="borderColor" variant="text" density="compact" style="flex: none; width: 94%; max-height: 40vh">
              <video :src="headVideoInfos.s3Url" controls style="height: 100%; width: 100%"></video>

              <template #close v-if="!state.disabledVal">
                <v-icon class="text-24 opacity-50 cursor-pointer" color="textPrimary" @click="headVideoClose"
                  >mdi-close-circle</v-icon
                >
              </template>
            </v-alert>
          </template>
          <template v-else>
            <v-btn color="info" variant="outlined" prepend-icon="mdi-tray-arrow-up " :disabled="state.upLoading"
              >{{ state.upLoading ? "上传中..." : "上传视频" }}
              <UploadFile
                accept="video/*"
                v-model="formData.videoFileId"
                v-model:infos="headVideoInfos"
                @loading="val => (state.upLoading = val)"
                style="width: 146px; position: absolute; top: 0; left: -31%; opacity: 0"
              />
            </v-btn>
          </template>

          <template #prepend> <label class="required">视频文件</label></template>
        </v-input>
        <div style="margin-left: 24%; width: 75%" v-if="state.upLoading">
          <v-progress-linear indeterminate></v-progress-linear>
        </div>
        <v-text-field
          type="text"
          placeholder="请输入姓名"
          hide-details="auto"
          clearable
          v-model="formData.cname"
          :rules="rules.cname"
          :disabled="state.disabledVal"
        >
          <template #prepend> <label class="required">姓名 </label></template>
        </v-text-field>
        <v-text-field
          type="text"
          placeholder="请输入标识"
          hide-details="auto"
          clearable
          v-model="formData.name"
          :rules="rules.name"
          :disabled="state.disabledField"
        >
          <template #prepend> <label class="required">标识 </label></template>
        </v-text-field>
        <Select
          density="compact"
          variant="outlined"
          placeholder="请选择性别"
          hide-details="auto"
          :rules="rules.gender"
          v-model="formData.gender"
          clearable
          :mapDictionary="{ code: 'speak_gender' }"
          @change="doQueryDataSet"
          :disabled="state.disabledVal"
        >
          <template #prepend>
            <label class="required">性别 </label>
          </template>
        </Select>
        <Select
          density="compact"
          variant="outlined"
          placeholder="请选择姿势"
          hide-details="auto"
          :rules="rules.posture"
          v-model="formData.posture"
          clearable
          :mapDictionary="{ code: 'digitalhuman_posture' }"
          @change="doQueryDataSet"
          :disabled="state.disabledVal"
        >
          <template #prepend>
            <label class="required">姿势 <Explain>数字人形象的姿势 </Explain></label>
          </template>
        </Select>
        <Select
          density="compact"
          variant="outlined"
          placeholder="请选择分辨"
          hide-details="auto"
          :rules="rules.resolution"
          v-model="formData.resolution"
          clearable
          :mapDictionary="{ code: 'digitalhuman_resolution' }"
          @change="doQueryDataSet"
          :disabled="state.disabledVal"
        >
          <template #prepend>
            <label class="required">分辨率 <Explain>上传视频的分辨率</Explain></label>
          </template>
        </Select>

        <v-text-field
          type="text"
          placeholder="请输入eg: top,bottom,left,right"
          hide-details="auto"
          clearable
          v-model="formData.pads"
          :rules="rules.pads"
          :disabled="state.disabledVal"
        >
          <template #prepend>
            <label class="required">边框充填 <Explain>算法截取面部时的边框:上,下,左,右</Explain></label></template
          >
        </v-text-field>

        <v-textarea v-model.trim="formData.remark" placeholder="请输入" :disabled="state.disabledVal">
          <template #prepend> <label>备注</label></template>
        </v-textarea>
      </v-form>
    </div>
  </Pane>
</template>
<script setup>
import { reactive, toRefs, ref, defineProps } from "vue";
import _ from "lodash";
import Explain from "@/components/ui/Explain.vue";
import UploadFile from "@/components/business/UploadFile.vue";
import { http, validator, dataDictionary } from "@/utils";
import { useMapRemoteStore } from "@/stores";
const mapRemoteStore = useMapRemoteStore();
const props = defineProps({
  modelName: String
});
const state = reactive({
  operateType: "", //add 添加  、 edit 编辑
  disabledField: false,
  disabledVal: false,
  maxTokens: 4096,
  file: "",
  formData: {
    coverFileId: "",
    videoFileId: "",
    name: "",
    cname: "",
    gender: "",
    resolution: "",
    remark: "",
    posture: "",
    pads: "0,0,0,0"
  },
  showDataSet: false,
  upLoading: false
});
const { formData, showDataSet } = toRefs(state);
const headImgInfos = ref(null);
const headVideoInfos = ref(null);

const emits = defineEmits(["submit"]);
const refPane = ref();
const refForm = ref();
const validNumberInput = (value, min, max, errorMessage) => {
  if (value !== "") {
    if (value < min) {
      return `下限 ${min}`;
    } else if (value > max) {
      return `上限 ${max}`;
    } else {
      return true;
    }
  } else {
    return errorMessage;
  }
};
const regName = /^[a-zA-Z0-9_\u4e00-\u9fa5-]+$/;
const rules = reactive({
  coverFileId: [v => !!v || "请上传预览图片"],
  videoFileId: [
    value => {
      if (value && value.length > 0) {
        return true;
      } else {
        return "请上传视频文件";
      }
    }
  ],
  resolution: [v => !!v || "请选择分辨率"],
  posture: [v => !!v || "请选择姿势"],
  gender: [v => !!v || "请选择性别"],
  name: [
    value => {
      if (value && value.length > 0) {
        if ((value.length > 1 || value.length <= 30) && regName.test(value)) {
          return true;
        } else {
          return "请输入正确标识：中文、数字、字母、-、_";
        }
      } else {
        return "请输入标识";
      }
    }
  ],
  cname: [
    value => {
      if (value && value.length > 0 && value.length < 30) {
        return true;
      } else {
        return "请输入姓名";
      }
    }
  ],
  pads: [
    value => {
      if (value && value.length > 0) {
        value = value.split(",");
        let re = /^(?!0)\d{1,4}$|^0$/;
        let checkVal = value.every(item => re.test(item));
        if (value.length == 4 && checkVal) {
          return true;
        } else {
          return "请输入正整数边框充填值，比如:top,bottom,left,right";
        }
      } else {
        return "请输入边框充填";
      }
    }
  ]
});

const genderOptions = mapRemoteStore.options["speak_gender"];
const doAdd = async (options = {}) => {
  state.formData = { ...state.formData };
  const [err, res] = await http.post({
    ...options,
    showSuccess: true,
    url: `/api/digitalhuman/person/create`,
    data: {
      ...state.formData,
      modelName: props.modelName
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
    url: `/api/digitalhuman/person/${state.formData.name}/update`,
    data: {
      ...state.formData
    }
  });
  if (res) {
    refPane.value.hide();
    emits("submit");
  }
};

const doQueryDataSet = item => {
  state.showDataSet = item == "train" ? true : false;
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
      coverFileId: "",
      videoFileId: "",
      name: "",
      cname: "",
      gender: "",
      resolution: "",
      remark: "",
      posture: "",
      pads: "0,0,0,0"
    },
    operateType
  }) {
    refPane.value.show({
      title,
      refForm,
      showActions: operateType == "view" ? false : true
    });
    state.formData = _.pick(_.cloneDeep(infos), [
      "videoFileId",
      "name",
      "cname",
      "gender",
      "resolution",
      "remark",
      "posture",
      "pads",
      "coverFileId"
    ]);

    state.operateType = operateType;
    state.disabledVal = operateType == "view" ? true : false;
    state.disabledField = operateType == "add" ? false : true;
    if (operateType == "add") {
      //添加
      headImgInfos.value = null;
      headVideoInfos.value = null;
      state.upLoading = false;
    } else {
      //编辑
      headImgInfos.value = {
        s3Url: infos.cover
      };
      headVideoInfos.value = {
        s3Url: infos.video
      };
    }
  }
});

const headImgClose = () => {
  formData.value.coverFileId = "";
  headImgInfos.value = null;
};
const headVideoClose = () => {
  formData.value.videoFileId = "";
  headVideoInfos.value = null;
};
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
