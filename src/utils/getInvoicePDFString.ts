import { manipulateAsync } from 'expo-image-manipulator';

// Types
import type { ClientModel } from 'database/models/clientModel';
import type { MaterialModel } from 'database/models/materialModel';
import type { ServiceModel } from 'database/models/serviceModel';
import type { SubServiceModel } from 'database/models/subServiceModel';

import type { BusinessData } from 'screens/Main/Business/@types';

interface Props {
    data: BusinessData;
    service: ServiceModel;
    subServices?: SubServiceModel[];
    materials?: MaterialModel[];
    client?: ClientModel;
}

export interface Config {
    showLogo: boolean;
    showInvoiceName: boolean;
    showDigitalSignature: boolean;
    showSubtotals: boolean;
    showSubServicesDetails: boolean;
    showMaterialsDetails: boolean;
    showMaterialsImages: boolean;
}

// Data
export const getPaymentCondition = (service: ServiceModel) => service.installmentsAmount ? `${service.installmentsAmount} parcelas`
    : service.agreementInitialValue ? `${service.splitMethod === "percentage" ? `${service.agreementInitialValue}%` : `R% ${service.agreementInitialValue}`} antecipado e o valor restante ${!service.installmentsAmount ? "após a conclusão do serviço" : `dividido em ${service.installmentsAmount} parcelas`}`
        : "À vista";

export async function getPDFString(
    data: BusinessData,
    service: ServiceModel,
    subServices: SubServiceModel[],
    materials: MaterialModel[],
    client: ClientModel,
    config: Config
) {
    const servicesTypes = subServices?.map(subService => subService.types).flat();

    const subServicesTotal = subServices && subServices?.map(subService => subService.price * subService.amount).reduce((a, b) => a + b, 0);
    const materialsTotal = materials && materials?.map(material => material.price * material.amount).reduce((a, b) => a + b, 0);

    const serviceDateIn30Days = new Date();
    serviceDateIn30Days.setDate(serviceDateIn30Days.getDate() + 30);

    const title = config.showInvoiceName ? `Orçamento - ${service?.name}` : "Orçamento";

    const image = data.logo ? await manipulateAsync(data.logo!, [], { base64: true }) : null;
    const digitalSignature = data.digitalSignatureUri ? await manipulateAsync(data.digitalSignatureUri!, [], { base64: true }) : null;

    const materialImages = await Promise.all(materials?.map(async material => {
        if (material.image_url) {
            const image = await manipulateAsync(material.image_url, [], { base64: true });
            return image.base64;
        }
    }));

    const splitGeocodedAddress = data.geocodedAddress?.split(", ");

    const geocodedAddressBeforeStreetNumber = splitGeocodedAddress ? [splitGeocodedAddress[0], splitGeocodedAddress[1]]?.join(", ") : null;
    const geocodedAddressAfterStreetNumber = splitGeocodedAddress ? splitGeocodedAddress.slice(2).join(", ") : null;

    const html = `
    <html>

    <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
            :root {
                font-size: 40%;
                /* 1rem = 10px */

                --text-100: #C4C4C4;
                --text-200: #A1A1AA;

                --gray-100: '#666666';
                --gray-200: '#333333';
                --gray-300: '#292929';
                --gray-400: '#27272A';
                --gray-500: '#1E1F20';
                --gray-600: "#1C1B1F";

                --gap: 2.5rem;
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: sans-serif;
                font-style: normal;
                font-size: 1.8rem;
            }

            html {
                background: white;
                cursor: default;
            }

            body {
                box-sizing: border-box;
                margin: 0 auto;
                overflow: hidden;
                overflow-y: scroll;

                display: flex;
                flex-direction: column;
                padding: 3.5rem;
            }

            body,
            main,
            section {
                gap: var(--gap);
            }

            @media print {
                body {
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                }
            }

            header {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: start;
                gap: var(--gap);
                width: 100%;
            }

            header h1 {
                font-size: 2.8rem;
            }

            h1 {
                font: bold 100% sans-serif;
                text-align: right;
                text-transform: uppercase;
            }

            header .logo_mark {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                width: 100%;
                height: fit-content;
            }

            .full {
                width: 100%;
            }

            header .row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
            }

            header address {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-start;
                gap: 0.75rem;
            }

            main {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 100%;
            }

            main #main_header {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                width: 100%;

                background: linear-gradient(90deg, #C4C4C4 0%, #C4C4C4 52.81%, rgba(196, 196, 196, 0) 100%);
                border-radius: 1px;
                gap: 1rem;
                padding: 1.5rem var(--gap);
            }

            main #main_header p:nth-child(1) {
                font-weight: 700;
                font-size: 2.8rem;
                line-height: 150%;
                color: var(--gray-600);
            }

            main #main_header p:nth-child(2) {
                font-weight: 400;
                font-size: 1.2rem;
                line-height: 150%;
                color: var(--text-200);
            }

            .row {
                display: flex;
                flex-direction: row;
                align-items: flex-start;
                justify-content: space-between;
                gap: 1rem;
            }

            #basic_info .column {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-start;
                max-width: 65%;
            }

            .section_title {
                font-weight: 700;
                font-size: 1.8rem;
                line-height: 150%;
                color: var(--gray-600);
            }

            .section_description {
                font-weight: 400;
                font-size: 1.8rem;
                line-height: 125%;
                color: var(--gray-500);
            }

            section {
                display: flex;
                flex-direction: column;
            }

            section header {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: flex-start;
                gap: 1rem;
                width: 100%;
                padding: 1rem var(--gap);
                background-color: var(--text-100);
                border-radius: 1px;
            }

            section header p {
                display: flex;
                font-style: normal;
                font-weight: 700;
                font-size: 1.8rem;
                line-height: 150%;
                color: var(--gray-200);
            }

            .table_header .description {
                flex: 1;
            }

            .table_header .quantity {
                width: 10rem;
                justify-content: flex-end;
            }

            .table_header .price {
                width: 15rem;
                justify-content: flex-end;
            }

            .table_header .total {
                width: 10rem;
                justify-content: flex-end;
            }

            .sub_sectionHeader {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: flex-start;
                gap: 1rem;
                width: 100%;
                padding: 1rem var(--gap);
                background-color: #E9E9E9;
                border-radius: 1px;
            }

            .sub_sectionHeader p {
                display: flex;
                font-style: normal;
                font-weight: 600;
                font-size: 1.8rem;
                line-height: 150%;
                color: var(--gray-300);
            }

            table {
                width: 100%;
                padding-inline: 2.5rem;
                border-spacing: 0 2rem;
                margin-block: -2rem;
            }

            table td {
                vertical-align: top;
            }

            table td h3 {
                font-style: normal;
                font-weight: 700;
                font-size: 1.8rem;
                line-height: 150%;
                color: var(--gray-200);
            }

            table td h4 {
                font-style: normal;
                font-weight: 500;
                font-size: 1.6rem;
                color: var(--gray-100);
            }

            table td.quantity p,
            table td.price p {
                font-weight: 500;
                font-size: 1.8rem;
                color: var(--gray-100);
            }

            table td.total p {
                font-weight: 600;
                font-size: 1.8rem;
                color: var(--gray-200);
            }

            table td:not(:nth-child(1)) {
                justify-content: flex-end;
                text-align: end;
            }

            /* Arrumar o espaçamento extra do header */
            table td:nth-child(3) {
                padding-right: 1rem;
            }

            table td:nth-child(2) {
                padding-right: 2rem;
            }

            table td:nth-child(1) {
                padding-right: 3rem;
            }

            .line {
                display: flex;
                width: 100%;
                height: 1px;
                background-color: var(--text-100);
            }

            .subsection {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                gap: 1.5rem;
            }

            .subtotal {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                width: 37.5rem;
                padding: 1rem var(--gap);
                background-color: #E9E9E9;
                border-radius: 1px;
                align-self: flex-end;
            }

            .subtotal p {
                font-weight: 600;
                font-size: 1.8rem;
                line-height: 150%;
                color: var(--gray-200);
            }

            .earnings_total {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                width: 100%;
                padding: 1rem var(--gap);
                background-color: #E9E9E9;
                border-radius: 1px;
            }

            .earnings_total p {
                font-weight: 700;
                font-size: 1.8rem;
                line-height: 150%;
                color: var(--gray-300);
            }

            .payment_info {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-start;
                gap: 1rem;
                padding: 1rem;
                width: fit-content;
                text-align: left;
                background-color: #E9E9E9;
                border-radius: 1px;
            }

            .payment_info p {
                font-weight: 400;
                font-size: 1.8rem;
                color: var(--gray-300);
            }

            .payment_info span {
                font-weight: bold;
            }

            #date {
                font-style: normal;
                font-weight: 700;
                font-size: 1.8rem;
                line-height: 150%;
                color: var(--gray-600);
            }

            .signature {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 1rem;

                margin-top: 10rem;
            }

            .signature .info {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }

            .signature div .line{
                width: 150%;
                min-width: 20rem;
                height: 1px;
                margin-top: -2rem;
                z-index: 10;
                background-color: black;
            }

            .signature .info p:nth-child(1) {
                font-style: normal;
                font-weight: 700;
                font-size: 1.8rem;
                line-height: 150%;
                color: black;
                text-transform: uppercase;
            }

            .signature .info p:nth-child(2) {
                font-style: normal;
                font-weight: 400;
                font-size: 1.6rem;
                line-height: 150%;
            }

            footer {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                gap: var(--gap);
                margin-top: 5rem;
            }
        </style>
    </head>

    <body>
        <header>
            <div class="logo_mark">
                ${data.logo && config.showLogo ? `
                    <img
                        style="max-height: 125; object-fit: contain;"
                        src="data:image/jpeg;base64,${image!.base64}"
                    />
                ` : ""}
                    <h1>${data.fantasyName}</h1>
            </div>
            <div class="row full">
                <address style="width: 50%;">
                    <p>${data.juridicalPerson}</p>
                    <p>${data.geocodedAddress ? `${geocodedAddressBeforeStreetNumber}${data.address ? `, ${data.address}` : ""}, ${geocodedAddressAfterStreetNumber}` : data.address ? data.address : ""} </p>
                    <p>    
                        CEP ${data.postalCode}
                    </p>
                </address>
                <address>
                    ${data.email ? `<div class="row">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_998_1654" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0"
                                width="24" height="24">
                                <rect width="24" height="24" fill="#D9D9D9" />
                            </mask>
                            <g mask="url(#mask0_998_1654)">
                                <path
                                    d="M4 20C3.45 20 2.97917 19.8042 2.5875 19.4125C2.19583 19.0208 2 18.55 2 18V6C2 5.45 2.19583 4.97917 2.5875 4.5875C2.97917 4.19583 3.45 4 4 4H20C20.55 4 21.0208 4.19583 21.4125 4.5875C21.8042 4.97917 22 5.45 22 6V18C22 18.55 21.8042 19.0208 21.4125 19.4125C21.0208 19.8042 20.55 20 20 20H4ZM20 8L12.525 12.675C12.4417 12.725 12.3542 12.7625 12.2625 12.7875C12.1708 12.8125 12.0833 12.825 12 12.825C11.9167 12.825 11.8292 12.8125 11.7375 12.7875C11.6458 12.7625 11.5583 12.725 11.475 12.675L4 8V18H20V8ZM12 11L20 6H4L12 11ZM4 8.25V6.775V6.8V6.7875V8.25Z"
                                    fill="#1C1B1F" />
                            </g>
                        </svg>
                        <p>${data.email}</p>
                    </div>` : ""}
                    <div class="row">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_998_1669" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0"
                                width="24" height="24">
                                <rect width="24" height="24" fill="#D9D9D9" />
                            </mask>
                            <g mask="url(#mask0_998_1669)">
                                <path
                                    d="M19.95 21C17.8 21 15.7042 20.5208 13.6625 19.5625C11.6208 18.6042 9.8125 17.3375 8.2375 15.7625C6.6625 14.1875 5.39583 12.3792 4.4375 10.3375C3.47917 8.29583 3 6.2 3 4.05C3 3.75 3.1 3.5 3.3 3.3C3.5 3.1 3.75 3 4.05 3H8.1C8.33333 3 8.54167 3.075 8.725 3.225C8.90833 3.375 9.01667 3.56667 9.05 3.8L9.7 7.3C9.73333 7.53333 9.72917 7.74583 9.6875 7.9375C9.64583 8.12917 9.55 8.3 9.4 8.45L6.975 10.9C7.675 12.1 8.55417 13.225 9.6125 14.275C10.6708 15.325 11.8333 16.2333 13.1 17L15.45 14.65C15.6 14.5 15.7958 14.3875 16.0375 14.3125C16.2792 14.2375 16.5167 14.2167 16.75 14.25L20.2 14.95C20.4333 15 20.625 15.1125 20.775 15.2875C20.925 15.4625 21 15.6667 21 15.9V19.95C21 20.25 20.9 20.5 20.7 20.7C20.5 20.9 20.25 21 19.95 21ZM6.025 9L7.675 7.35L7.25 5H5.025C5.10833 5.68333 5.225 6.35833 5.375 7.025C5.525 7.69167 5.74167 8.35 6.025 9ZM19 18.95V16.75L16.65 16.275L14.975 17.95C15.625 18.2333 16.2875 18.4583 16.9625 18.625C17.6375 18.7917 18.3167 18.9 19 18.95Z"
                                    fill="#1C1B1F" />
                            </g>
                        </svg>
                        <p>${data.phone}</p>
                    </div>
                    ${data.phone2 ? `<div class="row">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_998_1669" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0"
                                width="24" height="24">
                                <rect width="24" height="24" fill="#D9D9D9" />
                            </mask>
                            <g mask="url(#mask0_998_1669)">
                                <path
                                    d="M19.95 21C17.8 21 15.7042 20.5208 13.6625 19.5625C11.6208 18.6042 9.8125 17.3375 8.2375 15.7625C6.6625 14.1875 5.39583 12.3792 4.4375 10.3375C3.47917 8.29583 3 6.2 3 4.05C3 3.75 3.1 3.5 3.3 3.3C3.5 3.1 3.75 3 4.05 3H8.1C8.33333 3 8.54167 3.075 8.725 3.225C8.90833 3.375 9.01667 3.56667 9.05 3.8L9.7 7.3C9.73333 7.53333 9.72917 7.74583 9.6875 7.9375C9.64583 8.12917 9.55 8.3 9.4 8.45L6.975 10.9C7.675 12.1 8.55417 13.225 9.6125 14.275C10.6708 15.325 11.8333 16.2333 13.1 17L15.45 14.65C15.6 14.5 15.7958 14.3875 16.0375 14.3125C16.2792 14.2375 16.5167 14.2167 16.75 14.25L20.2 14.95C20.4333 15 20.625 15.1125 20.775 15.2875C20.925 15.4625 21 15.6667 21 15.9V19.95C21 20.25 20.9 20.5 20.7 20.7C20.5 20.9 20.25 21 19.95 21ZM6.025 9L7.675 7.35L7.25 5H5.025C5.10833 5.68333 5.225 6.35833 5.375 7.025C5.525 7.69167 5.74167 8.35 6.025 9ZM19 18.95V16.75L16.65 16.275L14.975 17.95C15.625 18.2333 16.2875 18.4583 16.9625 18.625C17.6375 18.7917 18.3167 18.9 19 18.95Z"
                                    fill="#1C1B1F" />
                            </g>
                        </svg>
                        <p>${data.phone2}</p>
                    </div>`
            : ""}
                </address>
            </div>
        </header>

        <main>
            <header id="main_header">
                <p>${title}</p>
                <p>#${service?.id}</p>
            </header>

            <section class="full">
                <div class="row">
                    ${service?.client && service.client.id ? `
                    <div class="column">
                        <p class="section_title">Cliente: ${client?.name}</p>
                        ${client?.address && `<p class="section_description">${client?.address}</p>`}
                    </div>`
            : ""}
                    <div class="column">
                        <p class="section_title">Data e horário da visita técnica</p>
                        <p class="section_description">${service.date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })} - ${service.date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            })}</p >
                    </div>
                </div>
            </section>

            <section class="full">
                <header class="table_header">
                    <p class="description">Descrição</p>
                    <p class="quantity">Qtd.</p>
                    <p class="price">Preço Unitário</p>
                    <p class="total">Total</p>
                </header>
                
                ${subServices && subServices.length > 0 ? `
                        <div class="subsection">
                            <div class="sub_sectionHeader">
                                <p>Serviços</p>
                            </div>
                            <table class="full">
                                <colgroup>
                                    <col style="flex: 1;">
                                    <col style="width: 10rem;">
                                    <col style="width: 15rem;">
                                    <col style="width: 10rem;">
                                </colgroup>

                                <tbody>
                                   ${subServices.map(subService => `
                                        <tr>
                                            <td>
                                                <h3>${subService.description}</h3>
                                                ${subService.details ? config.showSubServicesDetails ? `
                                                    <h4>${subService.details}</h4>
                                                ` : ""
                    : ""}
                                            </td>
                                            <td class="quantity">
                                                <p>${subService.amount}</p>
                                            </td>
                                            <td class="price">
                                                <p>R$ ${subService.price}</p>
                                            </td>
                                            <td class="total">
                                                <p>R$ ${subService.price * subService.amount}</p>
                                            </td>
                                        </tr>
                                        `).toString().split(',').join('')}
                                </tbody>
                            </table>
                            <div class="line"></div>
                            ${config.showSubtotals ? `<div class="subtotal">
                                <p>Subtotal</p>
                                <p>R$ ${subServicesTotal}</p>
                            </div>` : ""}
                        </div>            
                    `
            : ""}

                ${materials && materials.length > 0 ? `
                        <div class="subsection">
                            <div class="sub_sectionHeader">
                                <p>Materiais</p>
                            </div>
                            <table class="full">
                                <colgroup>
                                    <col style="flex: 1;">
                                    <col style="width: 10rem;">
                                    <col style="width: 15rem;">
                                    <col style="width: 10rem;">
                                </colgroup>

                                <tbody>
                                   ${materials.map((material, index) => `
                                        <tr>
                                            <td>
                                                <h3>${material.name}</h3>
                                                ${material.description ? config.showMaterialsDetails && `
                                                    <h4>${material.description}</h4>
                                                ` : ""
                }
                                            </td>
                                            <td class="quantity">
                                                <p>${material.amount}</p>
                                            </td>
                                            <td class="price">
                                                <p>R$ ${material.price}</p>
                                            </td>
                                            <td class="total">
                                                <p>R$ ${material.price * material.amount}</p>
                                            </td>
                                        </tr>
                                        `).toString().split(',').join('')}

                                </tbody>
                            </table>
                            <div class="line"></div>
                            ${config.showSubtotals ? `<div class="subtotal">
                                <p>Subtotal</p>
                                <p>R$ ${materialsTotal}</p>
                            </div>` : ""}
                        </div>
                        ${materialImages && materialImages.length > 0 ? `
                        <div class="full" style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 2.5rem; flex-wrap: wrap;">
                            ${materialImages.map((materialImage, index) => `
                                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem;">
                                    <img
                                        style="max-height: 125; object-fit: contain;"
                                        src="data:image/jpeg;base64,${materialImage}"
                                        alt="Imagem do material ${materials[index].name}" 
                                    />
                                    <p>${materials[index].name}</p>
                                </div>
                            `)}
                        </div>
                        ` : ""}
                    `
            : ""}

            </section>

            <div class="earnings_total">
                <p>Total</p>
                <p>R$ ${subServicesTotal ? subServicesTotal : 0 + (materialsTotal ? materialsTotal : 0)}</p>
            </div>

            <section class="full">
                <header>
                    <p>Pagamento</p>
                </header>
                <div class="row">
                    <div class="column">
                        <p class="section_title">Condições de Pagamento</p>
                        <p class="section_description">${getPaymentCondition(service)}</p>
                    </div>
                    ${service.paymentMethods.length > 0 ? `<div class="column">
                        <p class="section_title">Meios de Pagamento</p>
                        <p class="section_description">${service.paymentMethods.join(", ")}</p>
                    </div>` : ""}
                </div>
                ${data.pixKey || data.bank ? `<div class="row" style="justify-content: flex-start; gap: var(--gap);">
                    ${data.bank && data.bankAccountType && data.account && data.agency ? `<div class="payment_info">
                        <p><span>Conta Corrente:</span> ${data.account}</p>
                        <p><span>Agência:</span> ${data.agency}</p>
                        <p><span>Banco:</span> ${data.bank}</p>
                    </div>` : ""}
                    ${data.pixKey ? `<div class="payment_info">
                        <p><span>PIX:</span> ${data.pixKey}</p>
                    </div>` : ""}
                </div>` : ""}
            </section>

            <section class="full">
                <header>
                    <p>Garantia</p>
                </header>
                <div class="row">
                    <div class="column" style="min-width: 25%;">
                        <p class="section_title">Período de Garantia</p>
                        <p class="section_description">${service.warrantyPeriod} dias</p>
                    </div>
                    ${service.warrantyDetails && `
                        <div class="column">
                        <p class="section_title">Condições da Garantia</p>
                        <p class="section_description">${service.warrantyDetails}</p>
                        </div>
                    `}
                </div>
            </section>

            ${service.additionalInfo && service.additionalInfo.length > 0 && `<section class="full">
                <header>
                    <p>Garantia</p>
                </header>
                <div class="row">
                    <div class="column" style="min-width: 25%;">
                        <p class="section_title">Período de Garantia</p>
                        <p class="section_description">${service.warrantyPeriod} dias</p>
                    </div>
                    ${service.warrantyDetails && `
                        <div class="column">
                        <p class="section_title">Condições da Garantia</p>
                        <p class="section_description">${service.warrantyDetails}</p>
                        </div>
                    `}
                </div>
            </section>`}

            <p id="date">${data.geocodedAddress ? `${data.geocodedAddress.split(", ")[3]},` : ""} ${new Date().toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })}</p>

            <div class="signature">
                ${data.digitalSignatureUri && config.showDigitalSignature ? `
                    <img
                        style="width: 100%; height: 50; object-fit: contain; filter: invert(); z-index: -1; margin-bottom: -2rem;"
                        src="data:image/png;base64,${digitalSignature!.base64}"
                    />
                ` : ""}
                <div class="line"></div>
                <div class="info">
                    <p>${data.fantasyName}</p>
                    <p>${data.socialReason}</p>
                </div>
            </div>

            <div style="display: flex; flex: 1;">

            </div>

            <footer class="full">
                <div class="row full">
                    <div class="column" style="min-width: 25%;">
                        <p class="section_title">Validade do orçamento</p>
                        <p class="section_description">${serviceDateIn30Days.toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })}</p>
                    </div>

                    ${servicesTypes.length > 0 ? `<div class="column" style="min-width: 25%;">
                        <p class="section_title">Categorias</p>
                        <p class="section_description">${servicesTypes?.map(type => type.name).join(", ")}</p>
                    </div>` : ""}
                </div>

                <div class="full" style="display: flex; height: 1px; background-color: var(--text-100);">

                </div>
            </footer>
        </main>
    </body>

    </html>
    `
    return html;
}