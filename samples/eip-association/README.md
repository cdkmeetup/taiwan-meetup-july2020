# About

This sample demonstrates how to reuse existing `EIP` in AWS CDK

# Usage

```bash
cdk deploy EipAssociationStack \
-c use_default_vpc=1 \
-c eip_allocation_id=eipalloc-01e90a91e61f2cbee
```
(where `eipalloc-01e90a91e61f2cbee` is your existing EIP allocation ID)
