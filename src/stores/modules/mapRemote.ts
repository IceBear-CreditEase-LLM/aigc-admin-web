import { defineStore } from "pinia";
import { http, dataDictionary } from "@/utils";
import _ from "lodash";
import { toast } from "vue3-toastify";

type TypeOption = {
  label: string;
  value: string | number | boolean;
};

type TypeGetLabels = [any, string];

type TypeState = {
  /**
   * options 存放的是数组格式，用于构建下拉选项
   * 如：options.gender = [ {label:'男',value:1} , {label:'女',value:2} ]
   */
  options: {
    [key: string]: TypeOption[];
  };
  isInit: boolean;
  /**
   * mapping 存放的是对象格式，用于字段转义
   * 如：mapping.gender = {1:'男',2:'女'}
   */
  mappings: any;
};

export const useMapRemoteStore = defineStore({
  id: "mapRemote",
  getters: {},
  state: (): TypeState => ({
    mappings: {},
    options: {},
    isInit: false
  }),
  actions: {
    /**
     * 合成本地数据字典数据
     */
    _mergeLocalData() {
      let { mappings, options } = this;
      let { localData } = dataDictionary;

      // itemField 取值如 gender
      for (let itemField of Object.keys(localData)) {
        let itemType = localData[itemField];
        mappings[itemField] = itemType;

        options[itemField] = [];
        for (let itemValue of Object.keys(itemType)) {
          let value = itemValue;
          try {
            value = JSON.parse(itemValue);
          } catch (e) {}

          options[itemField].push({
            label: itemType[itemValue],
            value
          });
        }
      }
    },
    /**
     * 获取多个字段的label
     * @param {*} inValue
     * @returns Array
     * 比如 getFieldLabel([ ['gender','1'] ] ) =>  ['男']
     *     getFieldLabel([ ['gender','1'],['gender','2'] ] ) =>  ['男','女']
     */
    getLabels(inValue: Array<TypeGetLabels>) {
      let { mappings } = this;
      let ret = [];
      inValue.forEach(item => {
        let fieldName = item[0];
        let fieldValue = item[1];
        let cn = mappings[fieldName]?.[fieldValue];
        if (cn) {
          ret.push(cn);
        } else {
          if (window.env == "development") {
            window.errorMsg(`数据字典里，无法转义 ${fieldName}`);
          }
        }
      });
      if (inValue.length === 1) {
        //单个
        return ret.join("");
      } else {
        //多个
        return ret;
      }
    },
    async getAllRemoteMapping(): Promise<boolean> {
      this._mergeLocalData();
      const [err, res] = await http.get({
        url: `/api/sys/dict/tree`
      });
      if (res) {
        let { mappings, options } = this;
        res.forEach(itemType => {
          let fieldName = itemType.code; //如 gender
          if (!mappings[fieldName]) {
            mappings[fieldName] = {};
          }
          if (!options[fieldName]) {
            options[fieldName] = [];
          }
          (itemType.children || []).forEach((item, index) => {
            let { dictLabel: label, dictValue: value } = item;
            mappings[fieldName][value] = label;
            options[fieldName].push({
              label,
              value
            });
          });
        });

        this.isInit = true;
        return true;
      } else {
        console.error(" getAllRemoteMapping", err);
        return false;
      }
    }
  }
});
