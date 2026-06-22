"""scripts/lib — AI 数据更新管线的内部模块。

模块职责遵循 .docs/08-ai-update-pipeline.md：
- dates          日期/时间工具
- completeness   active upcoming 判定 + 关键字段完整性判定
- schedule       会议周期与下一届年份计算
- merger         AI 字段合并（只合并到 upcoming，不覆盖非空值）
- parser         AI 响应解析 + 字段校验
- prompt_builder Prompt 构造
- api_client     联网 API 调用 + 重试
- validator      调用 npm run validate
- logger         JSON Lines 运行日志 + 摘要
"""
