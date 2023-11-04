import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

import appSchema from "./schemas";

import { AccountModel } from "./models/account.model";
import { ProjectModel } from "./models/project.model";
import { OrderModel } from "./models/order.model";
import { CostumerModel } from "./models/costumer.model";
import { ProductModel } from "./models/product.model";
import { MaterialModel } from "./models/material.model";

import { AddressModel } from "./models/address.model";
import { BankAccountModel } from "./models/bankAccount.model";
import { CategoryModel } from "./models/category.model";
import { MarketplaceModel } from "./models/marketplace.model";
import { PixModel } from "./models/pix.model";
import { PaymentConditionsModel } from "./models/paymentConditions.model";
import { FeeModel } from "./models/fee.model";
import { DiscountModel } from "./models/discount.model";

// import migrations from "./migrations";

const adapter = new SQLiteAdapter({
    schema: appSchema,
    //migrations,
    jsi: true,
    onSetUpError: (error) => {
        console.log(error);
    },
});

export const database = new Database({
    adapter,
    modelClasses: [
        AccountModel,
        ProjectModel,
        MarketplaceModel,
        OrderModel,
        CostumerModel,
        ProductModel,
        MaterialModel,

        AddressModel,
        BankAccountModel,
        CategoryModel,
        PixModel,
        PaymentConditionsModel,
        FeeModel,
        DiscountModel,
    ],
});
