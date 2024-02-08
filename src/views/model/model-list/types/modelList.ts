export interface ItfModel {
  /** 主键，用于接口请求 */
  id: string;
  /** 名称 */
  modelName: string;
  /** 上限 */
  maxTokens: number;
  /** 是否私有 */
  isPrivate: boolean;
  /** 是否微调 */
  isFineTuning: boolean;
  /** 是否可用 */
  enabled: boolean;
  /** 备注 */
  remark: string;
  parameters: number;
  providerName: string;
  // datasetType: string;
  // evalPercent: number;
}

type a = Partial<ItfModel>;
