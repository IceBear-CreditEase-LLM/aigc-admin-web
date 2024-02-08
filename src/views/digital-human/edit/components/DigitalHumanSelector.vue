<script setup lang="ts">
import { ref, reactive, computed, onMounted, toRefs, inject } from "vue";
import { useRoute } from "vue-router";
import { http } from "@/utils";
import IconChecked from "@/components/ui/IconChecked.vue";

import { ItfProvideState, ItfDigitalHuman } from "../types";

const route = useRoute();

const provieDigitalHumanEdit = <ItfProvideState>inject("provieDigitalHumanEdit");

const state = reactive<{
  list: Array<ItfDigitalHuman>;
}>({
  list: []
});

const { selectedDigitalHuman } = toRefs(provieDigitalHumanEdit);

function onSelect(item, index) {
  provieDigitalHumanEdit.selectedDigitalHuman = item;
}

const getList = async () => {
  await http
    .get({
      showLoading: true,
      url: "/api/digitalhuman/person/list",
      data: {
        page: -1
      }
    })
    .then(([err, res]) => {
      if (res) {
        state.list = res.list;

        if (state.list.length > 0) {
          provieDigitalHumanEdit.selectedDigitalHuman = state.list[0];
        }
      }
    });
};

onMounted(() => {
  getList();
});
</script>

<template>
  <div>
    <!--视频播放-->
    <div style="aspect-ratio: 1">
      <video
        style="width: 100%; height: 100%"
        :src="selectedDigitalHuman.video"
        controls
        :poster="selectedDigitalHuman.cover"
      ></video>
    </div>

    <div class="box-list scrollbar-auto flex-1 pt-4 overflow-auto">
      <v-card
        variant="outlined"
        rounded="sm"
        elevation="0"
        class="pa-2 bg-hover-secondary d-inline-block list-item ma-2 overflow-visible"
        pointer
        v-for="(item, index) in state.list"
      >
        <div @click="onSelect(item, index)">
          <div class="image-human overflow-hidden">
            <img :src="item.cover" :alt="item.cname" />
          </div>
          <div class="hv-center mt-2">
            <div class="line1">{{ item.cname }}</div>
          </div>
          <IconChecked v-if="item.name === selectedDigitalHuman?.name" />
        </div>
      </v-card>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.box-list {
  overflow: scroll;
  white-space: nowrap;
  width: 100%;
}
.list-item {
  display: inline-block !important;
  width: 180px;

  &:hover {
    img {
      transform: scale(1.1);
    }
  }
  .image-human {
    aspect-ratio: 4/3;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: all 0.2s linear;
    }
  }
}
</style>
