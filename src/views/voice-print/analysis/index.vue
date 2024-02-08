<script setup>
import { ref, reactive } from "vue";
import $ from "jquery";
import { http } from "@/utils";

import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue";
import UiParentCard from "@/components/shared/UiParentCard.vue";

const dialog = ref(false);
const loading = ref(false);
const rating = ref(0);
const voice1 = ref("");
const voice2 = ref("");
const canUpload = ref(false);
const page = ref({ title: "声纹识别" });
const detail = reactive({ data: {} });
const breadcrumbs = ref([
  {
    text: "智能声纹",
    disabled: false,
    href: "#"
  },
  {
    text: "声纹识别",
    disabled: true,
    href: "#"
  }
]);
function uploadFile1(event) {
  const selectedAudio = $("#file1")[0].files[0];
  const audioURL = URL.createObjectURL(selectedAudio);
  const audio1 = $("#audio1")[0];
  audio1.src = audioURL;
  if ($("#file1")[0].files[0] && $("#file2")[0].files[0]) {
    canUpload.value = true;
  } else {
    canUpload.value = false;
  }
}
function uploadFile2(event) {
  const selectedAudio = $("#file2")[0].files[0];
  const audioURL = URL.createObjectURL(selectedAudio);
  const audio2 = $("#audio2")[0];
  audio2.src = audioURL;
  if ($("#file1")[0].files[0] && $("#file2")[0].files[0]) {
    canUpload.value = true;
  } else {
    canUpload.value = false;
  }
}
function voiceAnalysis() {
  if (loading.value) {
    return;
  }
  let file1 = $("#file1")[0].files[0];
  let file2 = $("#file2")[0].files[0];
  if (!file1) {
    return;
  }
  if (!file2) {
    return;
  }
  loading.value = true;
  var formData = new FormData();
  formData.append("file1", file1);
  formData.append("file2", file2);
  formData.append("threshold", 0.8);
  http
    .upload("/voice/compare", formData)
    .then(data => {
      let resData = data;
      loading.value = false;
      if (resData) {
        if (resData.code == 200) {
          detail.data = resData.data.data;
          rating.value = detail.data.dist * 10;
        } else {
          rating.value = 0;
        }
      }
    })
    .catch(error => {
      loading.value = false;
      console.error(error);
    });
  // dialog.value = true;
}
</script>
<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" md="6">
      <UiParentCard title="第一段声音">
        <div class="d-flex flex-column flex-sm-row gap-3 justify-center">
          <audio id="audio1" controls>Your browser does not support the audio element.</audio>
        </div>
        <div class="d-flex flex-column flex-sm-row gap-3 justify-center" style="margin-top: 20px">
          <!-- accept="audio/*, .mp3, .wma, .amr, .wav, .m4a" -->
          <v-file-input
            id="file1"
            ref="file1"
            accept="audio/*, .mp3, .wma, .amr, .wav, .m4a"
            label="选择第一段音频"
            @change="uploadFile1"
            prepend-icon="mdi-volume-high"
            hide-details
            variant="outlined"
          ></v-file-input>
        </div>
      </UiParentCard>
    </v-col>
    <v-col cols="12" md="6">
      <UiParentCard title="第二段声音">
        <div class="d-flex flex-column flex-sm-row gap-3 justify-center">
          <audio id="audio2" controls>Your browser does not support the audio element.</audio>
        </div>
        <div class="d-flex flex-column flex-sm-row gap-3 justify-center" style="margin-top: 20px">
          <!-- accept="audio/*, .mp3, .wma, .amr, .wav, .m4a" -->
          <v-file-input
            id="file2"
            ref="file2"
            accept="audio/*, .mp3, .wma, .amr, .wav, .m4a"
            label="选择第二段音频"
            @change="uploadFile2"
            prepend-icon="mdi-volume-high"
            hide-details
            variant="outlined"
          ></v-file-input>
        </div>
      </UiParentCard>
    </v-col>
    <v-col cols="12">
      <v-card elevation="10">
        <v-card-text>
          <div class="d-flex flex-column flex-sm-row gap-3 justify-center">
            <v-btn
              :loading="loading"
              :disabled="!canUpload"
              color="secondary"
              width="200"
              height="48"
              @click="voiceAnalysis"
              size="large"
              >开始分析</v-btn
            >
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12">
      <UiParentCard title="分析结果">
        <v-card-actions class="flex-column">
          <v-card-text style="font-size: 20px"> {{ detail.data.message }} </v-card-text>
          <v-rating v-model="rating" length="10" readonly density="compact" size="large" color="warning"></v-rating>
        </v-card-actions>
      </UiParentCard>
    </v-col>
  </v-row>
  <v-dialog v-model="dialog" max-width="800" title="分析结果">
    <v-card>
      <v-card-actions class="flex-column">
        <v-card-text style="font-size: 20px">
          {{ detail.data.message }}
        </v-card-text>
        <v-rating v-model="rating" length="10" readonly density="compact" size="large" color="warning"></v-rating>
        <v-btn
          color="secondary"
          class="px-4 mx-auto"
          @click="dialog = false"
          variant="tonal"
          width="200"
          height="48"
          style="margin-top: 20px"
          >关闭</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<style scoped>
.voice_1 {
  background-color: #ebf9fa;
}
.voice_2 {
  background-color: #fff5f2;
}
</style>
