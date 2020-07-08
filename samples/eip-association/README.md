# About

This sample demonstrates how to reuse existing `EIP` to create a new VPC and assign to the NAT Gateway instance.

see full discussion at https://t.me/AWSCDK/3818

# Usage

```bash
cdk deploy \
-c eip_allocation_id=eipalloc-01e90a91e61f2cbee
```
(where `eipalloc-01e90a91e61f2cbee` is your existing EIP allocation ID)
