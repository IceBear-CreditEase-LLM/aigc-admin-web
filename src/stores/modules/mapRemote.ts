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
    mergeLocalData() {
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
     * 比如 getLabels([ ['gender','1'] ] ) =>  ['男']
     *     getLabels([ ['gender','1'],['gender','2'] ] ) =>  ['男','女']
     */
    async getLabels(inValue: Array<TypeGetLabels>) {
      let { mappings } = this;
      let ret = [];
      inValue.forEach(async item => {
        let fieldName = item[0];
        let fieldValue = item[1];
        if (!fieldValue) {
          return;
        }
        if (!mappings[fieldName]) {
          //数据不存在
          await this.getOptionsByCode(fieldName);
        }
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
    /**
     * 查询数据字典
     *   页面使用 mappings 转义code，但页面里没用到对应code 的<Select  控件时，需要调用此方法
     */
    async loadDictTree(code: string | string[]) {
      let { options, mappings } = this;
      let arrCode = [];
      if (typeof code == "string") {
        arrCode.push(code);
      } else {
        arrCode = code;
      }
      let queryCode = arrCode.filter(item => {
        //过滤出没有缓存的code
        return !options[item];
      });
      if (queryCode.length == 0) {
        //没有要查询的code
        return;
      }
      const [err, res] = await http.get({
        url: `/api/sys/dict/tree`,
        data: {
          code: queryCode
        }
      });
      if (res) {
        res.forEach(itemType => {
          let code = itemType.code; //如 gender
          if (!mappings[code]) {
            mappings[code] = {};
          }
          if (!options[code]) {
            options[code] = [];
          }
          (itemType.children || []).forEach(item => {
            let { dictLabel: label, dictValue: value } = item;
            mappings[code][value] = label;
            options[code].push({
              label,
              value
            });
          });
        });
      } else {
        console.error(" getOptionsByCode", code, err);
      }
    },
    async getOptionsByCode(code: string): Promise<TypeOption[]> {
      await this.loadDictTree(code);
      return this.options[code];
    }
  }
});
