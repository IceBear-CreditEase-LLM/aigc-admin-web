<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <UiParentCard>
    <v-row>
      <v-col cols="12" lg="3" md="4" sm="6">
        <v-text-field
          density="compact"
          v-model="searchData.name"
          label="请输入姓名"
          hide-details
          clearable
          variant="outlined"
          @keyup.enter="doQueryFirstPage"
          @click:clear="doQueryFirstPage"
        ></v-text-field>
      </v-col>
      <!-- <v-col cols="12" lg="3" md="4" sm="6">
        <Select
          @change="doQueryFirstPage"
          label="请选择状态"
          :mapDictionary="{ code: 'digitalhuman_synthesis_status' }"
          v-model="searchData.status"
        ></Select>
      </v-col> -->
      <v-col cols="12" lg="3" md="4" sm="6">
        <ButtonsInForm>
          <v-btn color="primary" @click="onAdd">添加形象</v-btn>
        </ButtonsInForm>
      </v-col>
      <v-col cols="12">
        <AlertBlock> 生成视频的时间可能会比较长，请耐心等待！ </AlertBlock>
      </v-col>

      <v-col cols="12">
        <v-row ref="listContentRef" :class="{ 'justify-center': list.length === 0 }">
          <v-col v-if="list.length > 0" cols="12" lg="3" md="4" sm="6" v-for="item in list">
            <v-card elevation="10" rounded="md">
              <a class="card-list-item text-textPrimary text-decoration-none" href="javascript: void(0)">
                <v-img :src="item.cover" height="180px" cover class="rounded-t-md align-end text-right" @click="openDetail(item)">
                </v-img>
                <v-card-item class="pa-5">
                  <h5 class="text-h5 text-truncate" @click="openDetail(item)">
                    {{ item.cname }} （{{ mappings["speak_gender"][item.gender] }}-{{
                      mappings["digitalhuman_posture"][item.posture]
                    }}）
                  </h5>
                  <p class="text-subtitle-1 mt-1 text-medium-emphasis text-truncate" style="height: 15px">{{ item.remark }}</p>
                  <div class="d-flex align-center justify-space-between mt-2" style="height: 32px">
                    <div class="flex-1-1 d-flex justify-space-between text-medium-emphasis">
                      <span>{{
                        format.dateFromNow(item.updatedAt).indexOf("后") == -1
                          ? format.dateFromNow(item.updatedAt)
                          : format.dateFromNow(item.updatedAt).substr(0, format.dateFromNow(item.updatedAt).length - 1) + "前"
                      }}</span>
                    </div>
                    <v-btn class="ml-6" size="x-small" color="inherit" icon variant="text">
                      <IconDotsVertical width="14" stroke-width="1.5" />
                      <v-menu activator="parent">
                        <v-list density="compact" @click:select="operateMenuClick($event, item)">
                          <v-list-item
                            v-for="operate in getOperateConfig()"
                            :key="operate.key"
                            :value="operate.key"
                            hide-details
                            min-height="38"
                          >
                            <template v-slot:prepend>
                              <component
                                :is="operate.icon"
                                :size="16"
                                class="mr-2"
                                :class="[`text-${operate.color}`]"
                              ></component>
                            </template>
                            <v-list-item-title :class="[`text-${operate.color}`]">{{ operate.text }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </v-btn>
                  </div>
                </v-card-item>
              </a>
            </v-card>
          </v-col>
          <NoData v-else></NoData>
        </v-row>
        <Pager
          class="mt-5"
          ref="refPager"
          :page-sizes="[12, 24, 42, 64, 128]"
          :total="total"
          @query="doQuery"
          v-show="list.length > 0"
        />
      </v-col>
    </v-row>
  </UiParentCard>
  <DialogLog ref="refDialogLog" />

  <Detail ref="refDetail" />

  <ConfirmByClick ref="refConfirmDelete" @submit="doDelete">
    <template #text>
      <span class="font-weight-bold">这是进行一项操作时必须了解的重要信息</span><br />
      此操作将会<span class="text-primary">删除</span>该形象<br />
      形象姓名：<span class="text-primary">{{ currentOperateData.name }}</span
      ><br />
      你还要继续吗？
    </template>
  </ConfirmByClick>

  <PaneModelEstimate ref="refPaneModelEstimate" @submit="doQueryFirstPage" />
</template>
<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue";
import UiParentCard from "@/components/shared/UiParentCard.vue";
import AlertBlock from "@/components/ui/AlertBlock.vue";
import ConfirmByClick from "@/components/business/ConfirmByClick.vue";
import Pager from "@/components/global/Pager.vue";
import Detail from "./components/Detail.vue";
import DialogLog from "@/components/ui/log/DialogLog.vue";

import { http, format } from "@/utils";
import { IconDotsVertical, IconCircleMinus, IconEye, IconMarkdown, IconMarkdownOff } from "@tabler/icons-vue";
import { useMapRemoteStore } from "@/stores";
import PaneModelEstimate from "./components/PaneModelEstimate.vue";

const mapRemoteStore = useMapRemoteStore();

const mappings = mapRemoteStore.mappings;
const page = ref({ title: "形象列表" });
const breadcrumbs = ref([]);
const searchData = reactive({
  name: ""
});
const list = ref([]);
const total = ref(0);
const refPager = ref();
const refPaneModelEstimate = ref();

const refDetail = ref();
const refDialogLog = ref();

const refConfirmDelete = ref();
const currentOperateData = reactive({
  name: ""
});
const listContentRef = ref();

const doQuery = async (options = {}) => {
  const [err, res] = await http.get({
    url: "/api/digitalhuman/person/list",
    showLoading: listContentRef.value.$el,
    data: {
      ...searchData,
      ...options
    }
  });
  if (res) {
    list.value = res.list || [];
    total.value = res.total;
  } else {
    list.value = [];
    total.value = 0;
  }
};

const doQueryFirstPage = () => {
  refPager.value.query({ page: 1 });
};

const getOperateConfig = () => {
  let ret = [
    {
      text: "编辑",
      color: "info",
      icon: IconEye,
      key: "view"
    },
    {
      text: "下载",
      color: "success",
      icon: IconMarkdown,
      key: "download"
    },
    {
      text: "删除",
      color: "error",
      icon: IconCircleMinus,
      key: "delete"
    }
  ];
  return ret;
};
const onDownload = row => {
  window.open(row.video);
};
const operateMenuClick = ({ id }, item) => {
  currentOperateData.name = item.name;
  if (id === "view") {
    refPaneModelEstimate.value.show({
      title: "形象编辑",
      operateType: "edit",
      infos: item
    });
  } else if (id === "download") {
    onDownload(item);
  } else if (id === "delete") {
    refConfirmDelete.value.show({
      width: "400px"
    });
  }
};

const doDelete = async (options = {}) => {
  const [err, res] = await http.delete({
    ...options,
    showSuccess: true,
    url: `/api/digitalhuman/person/${currentOperateData.name}/delete`
  });
  if (res) {
    refConfirmDelete.value.hide();
    doQuery();
  }
};

const onAdd = () => {
  refPaneModelEstimate.value.show({
    title: "形象添加",
    operateType: "add"
  });
};

const openDetail = item => {
  refPaneModelEstimate.value.show({
    title: "形象详情",
    operateType: "view",
    infos: item
  });
};

onMounted(() => {
  doQuery();
});
</script>
<style lang="scss" scoped>
.status-corner-mark {
  position: absolute;
  background: #05b187;
  z-index: 999;
  width: 70px;
  text-align: center;
  height: 40px;
  line-height: 50px;
  border-radius: 3px;
  color: #fff;
  padding: 2px 4px 0;
  top: -11px;
  left: -26px;
  transform: rotate(-45deg);
  transition: transform 0.1s ease-in;
}
</style>
