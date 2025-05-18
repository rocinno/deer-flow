# Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
# SPDX-License-Identifier: MIT

import logging
import json
import json_repair

logger = logging.getLogger(__name__)


def repair_json_output(content: str) -> str:
    """
    Repair and normalize JSON output.

    Args:
        content (str): String content that may contain JSON

    Returns:
        str: Repaired JSON string, or original content if not JSON
    """
    content = content.strip()
    if content.startswith(("{", "[")) or "```json" in content or "```ts" in content:
        try:
            # If content is wrapped in ```json code block, extract the JSON part
            if content.startswith("```json"):
                content = content.removeprefix("```json")

            if content.startswith("```ts"):
                content = content.removeprefix("```ts")

            if content.endswith("```"):
                content = content.removesuffix("```")

            try:
                # First try standard JSON parsing
                json.loads(content)
                return content
            except json.JSONDecodeError as je:
                logger.info(f"Standard JSON parsing failed, attempting repair: {je}")
                # Try to repair and parse JSON
                repaired_content = json_repair.loads(content)
                return json.dumps(repaired_content, ensure_ascii=False)
        except Exception as e:
            logger.warning(f"JSON repair failed: {e}")
            
            # Additional fallback method for specific cases
            try:
                # Manual repair for common issues
                # Replace incorrectly escaped quotes and fix missing commas
                import re
                fixed_content = re.sub(r'([^,{]\s*)"(\s*[},])', r'\1",\2', content)
                fixed_content = re.sub(r'([^,\[]\s*)"(\s*[\]}])', r'\1",\2', fixed_content)
                json_obj = json.loads(fixed_content)
                return json.dumps(json_obj, ensure_ascii=False)
            except Exception as e2:
                logger.warning(f"Manual JSON repair also failed: {e2}")
    return content
