<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <UiParentCard>
    <v-row>
      <v-col cols="12" lg="3" md="4" sm="6">
        <v-text-field
          density="compact"
          v-model="searchData.userName"
          label="用户姓名"
          hide-details
          variant="outlined"
          :clearable="true"
          @keyup.enter="doQueryFirstPage"
          @click:clear="doQueryFirstPage"
        ></v-text-field>
      </v-col>
      <v-col cols="12" lg="3" md="4" sm="6">
        <v-text-field
          density="compact"
          v-model="searchData.userKey"
          label="用户标识"
          hide-details
          variant="outlined"
          :clearable="true"
          @keyup.enter="doQueryFirstPage"
          @click:clear="doQueryFirstPage"
        ></v-text-field>
      </v-col>
      <v-col cols="12">
        <TableWithPager @query="doTableQuery" ref="tableWithPagerRef" :infos="tableInfos">
          <el-table-column label="用户姓名" prop="userName" min-width="200px"></el-table-column>
          <el-table-column label="用户标识" min-width="200px">
            <template #default="{ row }">
              <span v-copy="row.userKey">{{ row.userKey }}</span>
            </template>
          </el-table-column>
          <el-table-column label="音频文件" min-width="300px">
            <template #default="{ row }">
              <AiAudio :src="row?.s3Url" />
            </template>
          </el-table-column>
        </TableWithPager>
      </v-col>
    </v-row>
  </UiParentCard>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue";
import UiParentCard from "@/components/shared/UiParentCard.vue";
import AiAudio from "@/components/business/AiAudio.vue";
import { http } from "@/utils";

const page = ref({ title: "声纹库" });
const breadcrumbs = ref([
  {
    text: "智能声纹",
    disabled: false,
    href: "#"
  },
  {
    text: "声纹库",
    disabled: true,
    href: "#"
  }
]);

const tableWithPagerRef = ref();
const tableInfos = reactive({
  list: [],
  total: 0
});

const searchData = reactive({
  userName: "",
  userKey: ""
});

const doQueryFirstPage = () => {
  tableWithPagerRef.value.query({ page: 1 });
};

const doTableQuery = async (options = {}) => {
  const [err, res] = await http.get({
    url: "/voice/list",
    showLoading: tableWithPagerRef.value.el,
    data: {
      ...searchData,
      ...options
    }
  });
  if (res) {
    tableInfos.list = res.list || [];
    tableInfos.total = res.total;
  } else {
    tableInfos.list = [];
    tableInfos.total = 0;
  }
};

onMounted(() => {
  doTableQuery();
});
</script>
