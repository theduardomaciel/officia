import { appSchema } from "@nozbe/watermelondb";

import { accountSchema } from "./account.schema";
import { projectSchema } from "./project.schema";
import { orderSchema } from "./order.schema";
import { costumerSchema } from "./costumer.schema";
import { productSchema } from "./product.schema";
import { materialSchema } from "./material.schema";

import { marketplaceSchema } from "./marketplace.schema";
import { categorySchema } from "./category.schema";
import { addressSchema } from "./address.schema";
import { bankAccountSchema } from "./bankAccount.schema";
import { pixSchema } from "./pix.schema";
import { paymentConditionsSchema } from "./paymentConditions.schema";

import { feeSchema } from "./fee.schema";
import { discountSchema } from "./discount.schema";

export default appSchema({
    version: 1,
    tables: [
        accountSchema,
        projectSchema,
        marketplaceSchema,
        orderSchema,
        costumerSchema,
        productSchema,
        materialSchema,
        addressSchema,
        bankAccountSchema,
        categorySchema,
        pixSchema,
        paymentConditionsSchema,
        feeSchema,
        discountSchema,
    ],
});
