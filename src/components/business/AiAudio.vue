<template>
  <div class="compo-aiAudio">
    <audio v-if="type == 'simple'" style="vertical-align: top" :src="src" controls>
      Your browser does not support the audio element.
    </audio>
    <div
      class="aiAudio-complex"
      v-loading="!style.isReadyComplex"
      :element-loading-text="$t('aiAudio.loadingText')"
      v-else-if="type == 'complex'"
    >
      <div ref="refBoxComplex" :class="style.classNameComplex"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, toRefs, ref, onMounted, watchEffect } from "vue";
import WaveSurfer from "wavesurfer.js";
import $ from "jquery";

enum EnumGender {
  Male = 1, //  男
  Female = 2, //女
  Unknown = 3 //未知
}

interface Props {
  /** 音频地址 */
  src: string;
  /** 性别 1:男， 2:女  ，3:未知*/
  gender?: EnumGender;
  /** 模式 simple简易、complex复杂 */
  type?: "simple" | "complex";
  time?: number;
}

const refBoxComplex = ref<HTMLElement>();
const state = reactive({
  style: {
    isReadyComplex: false,
    classNameComplex: "opacity-0"
  },
  formData: {}
});
const { style, formData } = toRefs(state);

const props = withDefaults(defineProps<Props>(), {
  src: "",
  gender: 3,
  type: "simple"
});

const renderWave = () => {
  let { type, gender, src } = props;
  if (type == "complex" && src) {
    //清空内容，避免生成多个
    $(refBoxComplex.value).html("");
    let colors = {
      [EnumGender.Male]: {
        waveColor: "#38bdf8",
        progressColor: "#38bdf850",
        cursorColor: "#CCC"
      },
      [EnumGender.Female]: {
        waveColor: "#f980e9",
        progressColor: "#f980e950",
        cursorColor: "#ccc"
      },

      [EnumGender.Unknown]: {
        waveColor: "#475569",
        progressColor: "#47556950",
        cursorColor: "#ccc"
      }
    };
    let { waveColor, progressColor, cursorColor } = colors[gender];
    const wavesurfer = WaveSurfer.create({
      container: refBoxComplex.value,
      waveColor,
      progressColor,
      cursorColor,
      cursorWidth: 3,
      // media: audio,
      mediaControls: true,
      // url: "https://wavesurfer.xyz/wavesurfer-code/examples/audio/audio.wav",
      url: src,
      autoplay: false,
      /** Pass false to disable clicks on the waveform */
      interact: true
    });

    wavesurfer.on("ready", () => {
      renderWaveWithNoProblem();
    });
  }
};

/**
 * 绘制UI，修复播放条宽度问题
 */
const renderWaveWithNoProblem = () => {
  state.style.classNameComplex = "w-75 opacity-0";

  setTimeout(() => {
    state.style.classNameComplex = "w-100 opacity-0";
  }, 100);

  setTimeout(() => {
    state.style.isReadyComplex = true;
    state.style.classNameComplex = "";
  }, 200);
};

watchEffect(() => {
  let { type, src } = props;
  if (type == "complex" && src) {
    setTimeout(() => {
      renderWave();
    }, 100);
  }
});

// onMounted(() => {

// });
</script>
<style lang="scss">
.compo-aiAudio {
  .aiAudio-complex {
    min-height: 180px;
  }
}
</style>
