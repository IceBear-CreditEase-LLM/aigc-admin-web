<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" md="6">
      <UiParentCard title1="人物视频"> <DigitalHumanSelector /> </UiParentCard>
    </v-col>
    <v-col cols="12" md="6">
      <UiParentCard title="开始数字人合成">
        <v-form ref="refForm" class="my-form">
          <v-row>
            <v-col cols="12">
              <v-label class="mb-2 required"
                >标题<Explain class="ml-2">用于列表展示和搜索，能够快速了解基本信息</Explain></v-label
              >
              <v-text-field
                density="compact"
                variant="outlined"
                placeholder="请输入标题"
                hide-details="auto"
                :rules="rules.title"
                v-model="formData.title"
              >
              </v-text-field>
            </v-col>

            <v-col cols="12">
              <v-label class="mb-2 required" style="white-space: inherit">
                <div>请输入语音播放文本，文本内容小于200个字(包括标点符号)。</div>
              </v-label>

              <v-textarea v-model.trim="formData.text" :rules="rules.text" placeholder="请输入" counter rows="5" maxlength="200">
              </v-textarea>
            </v-col>

            <v-col cols="12">
              <v-label class="mb-2 required">是否超分</v-label>
              <v-switch v-model="formData.isGfpgan" color="primary" hide-details="auto"></v-switch>
            </v-col>

            <v-col cols="12">
              <v-label class="mb-2 required">请选择需要合成的发声人</v-label>
              <SpeakerSelector v-model="formData.speakName" />
            </v-col>
            <v-col cols="12" class="hv-center">
              <AiBtn id="btnSubmit" color="secondary" width="200" height="48" size="large" @click="onSubmit">开始合成</AiBtn>
            </v-col>
          </v-row>
        </v-form>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
<script setup lang="ts">
import { reactive, toRefs, ref, onMounted, provide } from "vue";
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue";
import UiParentCard from "@/components/shared/UiParentCard.vue";
import Explain from "@/components/ui/Explain.vue";
import DigitalHumanSelector from "./components/DigitalHumanSelector.vue";
import { http, validator } from "@/utils";
import { toast } from "vue3-toastify";
import { ItfProvideState, ItfSpeaker } from "./types";
import SpeakerSelector from "@/components/business/SpeakerSelector.vue";
import { useRouter } from "vue-router";

// import type * as Types from "./types";
const router = useRouter();

const refForm = ref();
const refSpeakerSelector = ref();

const state = reactive<ItfProvideState>({
  style: {},
  formData: {
    text: "",
    title: "",
    speakName: "",
    isGfpgan: false
  },
  selectedSpeaker: {
    speakName: "",
    speakCname: "",
    headImg: "",
    speakDemo: "",
    gender: "",
    ageGroup: "",
    subTitle: ""
  },
  selectedDigitalHuman: {
    name: "",
    cname: "",
    cover: "",
    video: ""
  },
  listSpeaker: []
});
const { style, formData, selectedSpeaker } = toRefs(state);
provide("provieDigitalHumanEdit", state);

const page = ref({ title: "创建视频" });
const breadcrumbs = ref([
  {
    text: "数字人",
    disabled: false,
    href: "#"
  },
  {
    text: "创建视频",
    disabled: true,
    href: "#"
  }
]);

const rules = reactive({
  title: [value => !!value || "请输入标题"],
  text: [value => !!value || "请输入语音播放文本"]
});

const onSubmit = async () => {
  const { valid } = await refForm.value.validate();
  if (valid) {
    const [err, res] = await http.post({
      url: "/api/digitalhuman/synthesis/create",
      showSuccess: true,
      showLoading: "btn#btnSubmit",
      data: {
        ...state.formData,
        dhpName: state.selectedDigitalHuman.name
      }
    });
    if (res) {
      router.push("/digital-human/video-list/list");
    }
  } else {
    let errorMsg = "请处理页面标错的地方后，再尝试提交";
    toast.warning(errorMsg);
  }
};
onMounted(() => {});
</script>
<style lang="scss" scoped>
.preview-voice {
  width: 200px;
}
</style>
