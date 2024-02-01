<template>
  <div class="">
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center" style="height: 76px">
        <div class="d-flex">
          <div style="width: 250px" class="mr-4">
            <Select
              @change="doQueryFirstPage"
              label="请选择评估状态"
              :mapDictionary="{ code: 'model_eval_status' }"
              v-model="searchData.status"
            ></Select>
          </div>
          <div style="width: 250px">
            <Select
              @change="doQueryFirstPage"
              label="请选择评估方式"
              :mapDictionary="{ code: 'model_eval_dataset_type' }"
              v-model="searchData.datasetType"
            ></Select>
          </div>
        </div>
        <el-tooltip
          ref="tooltipRef"
          :visible="state.showTooltip"
          :popper-options="{
            modifiers: [
              {
                name: 'computeStyles',
                options: {
                  adaptive: false,
                  enabled: false
                }
              }
            ]
          }"
          :auto-close="1"
          :virtual-ref="buttonRef"
          virtual-triggering
          popper-class="singleton-tooltip"
        >
          <template #content>
            <span>请先部署模型 </span>
          </template>
        </el-tooltip>
        <ButtonsInForm v-if="props.showArrange == 'success' || props.showArrange == 'running'">
          <v-btn color="primary" ref="buttonRef" @click="onAdd">创建模型</v-btn>
        </ButtonsInForm>
      </v-col>
      <v-col cols="12">
        <TableWithPager @query="doTableQuery" ref="refTableWithPager" :infos="state.tableInfos">
          <el-table-column label="指标" width="200px">
            <template #default="{ row }">{{ mappings["model_eval_metric"]?.[row.metricName] }} </template>
          </el-table-column>
          <el-table-column label="数据量" width="200px">
            <template #default="{ row }">{{ row.evalTotal }}</template>
          </el-table-column>
          <el-table-column label="评估数据集" width="200px">
            <template #default="{ row }"> {{ row.datasetType }}</template>
          </el-table-column>
          <el-table-column label="平均分" width="200px">
            <template #default="{ row }">{{ row.score }}</template>
          </el-table-column>
          <el-table-column label="进度" width="200px">
            <template #default="{ row }">{{ format.toPercent(row.progress, 2) }}</template>
          </el-table-column>
          <el-table-column label="评估状态" width="200px">
            <template #default="{ row }"> {{ dataDictionary.localData.local_trainStatus[row.status] }}</template>
          </el-table-column>
          <el-table-column label="备注" width="200px">
            <template #default="{ row }">{{ row.remark }}</template>
          </el-table-column>
          <el-table-column label="开始时间" width="200px">
            <template #default="{ row }">{{ format.dateFormat(row.startedAt, "YYYY-MM-DD HH:mm:ss") }} </template>
          </el-table-column>
          <el-table-column label="耗时" width="200px">
            <template #default="{ row }"> {{ format.dateFormat(row.duration, "YYYY-MM-DD HH:mm:ss") }}</template>
          </el-table-column>
          <el-table-column label="创建时间" width="200px">
            <template #default="{ row }">{{ format.dateFormat(row.createdAt, "YYYY-MM-DD HH:mm:ss") }}</template>
          </el-table-column>
          <el-table-column label="操作" min-width="120px" fixed="right">
            <template #default="{ row }">
              <ButtonsInTable :buttons="getButtons(row)" />
            </template>
          </el-table-column>
        </TableWithPager>
      </v-col>
    </v-row>
  </div>
  <ConfirmByInput ref="refConfirmAbort" @submit="doAbort">
    <template #text>
      此操作将会<span class="text-primary">取消</span>正在进行的模型评估<br />
      任务ID：<span class="text-primary font-weight-black">{{ state.currentJobId }}</span
      ><br />
      你还要继续吗？
    </template>
  </ConfirmByInput>
  <ConfirmByClick ref="refConfirmDelete" @submit="doRemove">
    <template #text>
      这是进行一项操作时必须了解的重要信息<br />
      您将要删除 <span class="text-primary font-weight-black">{{ confirmDelete.currentLabel }}</span> ，确定要继续吗？
    </template>
  </ConfirmByClick>
  <PaneModelEstimate ref="refPaneModelEstimate" @submit="doQueryFirstPage" :modelName="props.modelTitle" />
</template>
<script setup lang="ts">
import { reactive, toRefs, ref, onMounted } from "vue";
import { http, format, dataDictionary } from "@/utils";
import { TypeButtonsInTable } from "@/components/types/components.ts";
import PaneModelEstimate from "./PaneModelEstimate.vue";
import ConfirmByInput from "@/components/business/ConfirmByInput.vue";
import ConfirmByClick from "@/components/business/ConfirmByClick.vue";
import { useMapRemoteStore } from "@/stores";
import { useRoute } from "vue-router";
interface Props {
  /** 音频地址 */
  showArrange: string;
  modelTitle: string;
}
const props = defineProps({
  showArrange: String,
  modelTitle: String
});
const route = useRoute();
const mapRemoteStore = useMapRemoteStore();
const refTableWithPager = ref();
const refPaneModelEstimate = ref();
const buttonRef = ref();
const refConfirmAbort = ref();
const refConfirmDelete = ref();
const mappings = mapRemoteStore.mappings;
const state = reactive({
  style: {},
  formData: {
    modelName: "",
    datasetType: ""
  },
  showTooltip: false,
  timer: null,
  tableInfos: {
    list: [],
    total: 0
  },
  currentJobId: ""
});
const searchData = reactive({
  status: "",
  datasetType: ""
});
const confirmDelete = reactive({
  id: null,
  currentLabel: ""
});
const { formData, showTooltip } = toRefs(state);
// const props = withDefaults(defineProps<Props>(), {
//   showArrange: ""
// });

const onAdd = () => {
  refPaneModelEstimate.value.show({
    title: "添加评估",
    operateType: "add"
  });
};
const onAbort = row => {
  state.currentJobId = row.id;
  refConfirmAbort.value.show({
    width: "450px",
    confirmText: state.currentJobId
  });
};
const remove = data => {
  confirmDelete.currentLabel = data.modelName;
  confirmDelete.id = data.id;
  refConfirmDelete.value.show({
    width: "450px",
    confirmText: confirmDelete.currentLabel
  });
};

const doRemove = async (options = {}) => {
  const [err, res] = await http.delete({
    ...options,
    showSuccess: true,
    url: `/api/models/eval/${confirmDelete.id}`
  });
  if (res) {
    refConfirmDelete.value.hide();
    doTableQuery();
    // if (confirmDelete.id === currentNodeKey.value) {
    //   currentNodeKey.value = null;
    // }
  }
};

const doAbort = async (options = {}) => {
  const [err, res] = await http.post({
    ...options,
    showSuccess: true,
    url: `/api/models/eval/${state.currentJobId}/cancel`
  });
  if (res) {
    refConfirmAbort.value.hide();
    refTableWithPager.value.query();
  }
};
const getSubStatus = item => {
  let ret = mapRemoteStore.getLabels([["model_eval_dataset_type", item.datasetType]]);
  return ret;
};

const doTableQuery = async (options = {}) => {
  let { modelName } = route.query;
  const [err, res] = await http.get({
    url: `/api/models/eval`,
    showLoading: refTableWithPager.value.el,
    data: {
      modelName: modelName,
      ...searchData,
      ...options
    }
  });

  if (res) {
    state.tableInfos.total = res.total;
    state.tableInfos.list = res.list.map(item => {
      return {
        ...item,
        datasetType: getSubStatus(item)
      };
    });
  } else {
    state.tableInfos.list = [];
    state.tableInfos.total = 0;
  }
};
const doQueryFirstPage = () => {
  refTableWithPager.value.query({ page: 1 });
};

const getButtons = (row): Array<TypeButtonsInTable> => {
  let ret = [];
  if (row.status == "pending" || row.status == "running") {
    ret.push({
      text: "取消",
      color: "",
      click() {
        onAbort(row);
      }
    });
  } else {
    ret.push({
      text: "删除",
      color: "error",
      click() {
        remove(row);
      }
    });
  }
  return ret;
};

onMounted(() => {
  doTableQuery();
});
</script>
<style lang="scss">
.v-tooltip__content {
  pointer-events: initial;
}
</style>
