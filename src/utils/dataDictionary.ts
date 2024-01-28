import { http } from "./http";

//数据字典
export const dataDictionary = {
  /** 本地数据字典 */
  localData: {
    boolean: {
      true: "是",
      false: "否"
    },
    /** 训练状态 */
    local_trainStatus: {
      running: "训练中",
      success: "已完成",
      failed: "失败",
      waiting: "等待中",
      cancel: "已取消"
    },
    local_evaluation: {
      train: "训练数据集",
      upload: "上传验证集"
    },
    local_enabled: {
      true: "启用",
      false: "停用"
    }
  },

  async getOptionsByAPI({ url, data = {}, labelField = "id", valueField = "name" }) {
    let ret = [];
    const [err, res] = await http.get({
      url,
      data
    });
    if (res) {
      ret = res.list.map(item => {
        if (typeof item !== "object") {
          return {
            value: item,
            label: item
          };
        }

        return {
          value: item[valueField],
          label: item[labelField]
        };
      });
      dataDictionary.addBlankOption(ret);
    }
    return ret;
  },
  addBlankOption(inValue) {
    return;
    inValue.unshift({
      value: null, //跟后端约定，空项，value 传null
      label: ""
    });
  }
};
