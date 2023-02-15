import { Collection, Model } from "@nozbe/watermelondb";
import { field, readonly, date, children, relation, json, writer } from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";
import { ClientModel } from "./clientModel";
import { MaterialModel } from "./materialModel";
import { SubServiceModel } from "./subServiceModel";

const sanitizePaymentMethods = (rawReactions: string[]) => {
    return Array.isArray(rawReactions) ? rawReactions.map(String) : []
}

// Copilot Hint = (rawJson) => JSON.parse(rawJson)

export class ServiceModel extends Model {
    static table = "services";
    static associations: Associations = {
        sub_services: { type: "has_many", foreignKey: "service_id" },
        materials: { type: "has_many", foreignKey: "service_id" },
        clients: { type: "has_many", foreignKey: "service_id" },
    }

    @field("name") name!: string;
    @date("date") date!: Date;
    @field("status") status!: string;
    @field("additionalInfo") additionalInfo!: string | null;

    // Payment
    @field("paymentCondition") paymentCondition!: string;
    @json("paymentMethods", sanitizePaymentMethods) paymentMethods!: string[];
    // Agreement
    @field("splitMethod") splitMethod!: string | null;
    @field("agreementInitialValue") agreementInitialValue!: string | null;
    // Installments
    @field("installmentsAmount") installmentsAmount!: number | null;
    // Warranty
    @field("warrantyPeriod") warrantyPeriod!: number;
    @field("warrantyDetails") warrantyDetails!: string | null;

    @readonly @date('created_at') createdAt!: number;

    @children("sub_services") subServices!: SubServiceModel[];
    @children("materials") materials!: MaterialModel[];
    @relation("client", "service_id") client!: ClientModel;

    @writer async createService(data: ServiceModel) {
        const { name, date, status, additionalInfo, paymentCondition, paymentMethods, splitMethod, agreementInitialValue, installmentsAmount, warrantyPeriod, warrantyDetails } = data;

        const subServicesCollection: Collection<SubServiceModel> = this.collections.get('sub_services');
        const batchSubServices = data.subServices.map((subService) => {
            return subServicesCollection.prepareCreate((sub_service) => {
                sub_service.description = subService.description;
                sub_service.details = subService.details;
                sub_service.types = subService.types;
                sub_service.price = subService.price;
                sub_service.amount = subService.amount;
            })
        })

        const materialsCollection: Collection<MaterialModel> = this.collections.get('materials');
        const batchMaterials = data.materials.map((material) => {
            return materialsCollection.prepareCreate((material) => {
                material.parent._setRaw('service_id', this.id)
                material.name = material.name;
                material.description = material.description;
                material.image_url = material.image_url;
                material.price = material.price;
                material.amount = material.amount;
                material.profitMargin = material.profitMargin;
                material.availability = material.availability;
            })
        })

        const servicesCollection: Collection<ServiceModel> = this.collections.get('services');
        const result = await this.batch(
            servicesCollection.prepareCreate((service) => {
                service.name = name;
                service.date = date;
                service.status = status;
                service.additionalInfo = additionalInfo;
                service.paymentCondition = paymentCondition;
                service.paymentMethods = paymentMethods;
                service.splitMethod = splitMethod;
                service.agreementInitialValue = agreementInitialValue;
                service.installmentsAmount = installmentsAmount;
                service.warrantyPeriod = warrantyPeriod;
                service.warrantyDetails = warrantyDetails;
            }),
            batchSubServices as any,
            batchMaterials as any
        )
        console.log("Service created successfully.")
        return result;
    }

    @writer async addSubService(data: SubServiceModel) {
        const { description, details, types, price, amount } = data;

        const actualCollection: Collection<SubServiceModel> = this.collections.get('sub_services');
        return actualCollection.create((sub_service) => {
            sub_service.parent._setRaw("service_id", this.id);
            sub_service.description = description;
            sub_service.details = details;
            sub_service.types = types;
            sub_service.price = price;
            sub_service.amount = amount;
        });
    }

    @writer async addMaterial(data: MaterialModel) {
        const { name, description, image_url, price, amount, profitMargin, availability } = data;

        const actualCollection: Collection<MaterialModel> = this.collections.get('materials');
        return actualCollection.create((material) => {
            material.parent._setRaw("service_id", this.id);
            material.name = name;
            material.description = description;
            material.image_url = image_url;
            material.price = price;
            material.amount = amount;
            material.profitMargin = profitMargin;
            material.availability = availability;
        });
    }
}