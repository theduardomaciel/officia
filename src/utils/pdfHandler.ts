import { manipulateAsync } from "expo-image-manipulator";

// Types
import type { CostumerModel } from "database/models/costumer.model";
import type { MaterialModel } from "database/models/material.model";
import type { OrderModel } from "database/models/order.model";
import type { ProductModel } from "database/models/product.model";

import type { BusinessData } from "screens/Main/Business/@types";

interface Props {
	data: BusinessData;
	order: OrderModel;
	products?: ProductModel[];
	materials?: MaterialModel[];
	client?: CostumerModel;
}

export interface Config {
	showLogo: boolean;
	showInvoiceName: boolean;
	showDigitalSignature: boolean;
	showSubtotals: boolean;
	showProductsDetails: boolean;
	showMaterialsDetails: boolean;
	showMaterialsImages: boolean;
}

// Data
export const getPaymentCondition = (
	paymentCondition: string,
	splitValue?: string | null,
	splitRemaining?: string | null
) =>
	paymentCondition === "card"
		? `${splitValue?.replace("%", "")} parcelas`
		: paymentCondition === "agreement" && splitValue?.includes("%")
		? `${
				paymentCondition === "agreement" && splitValue?.includes("%")
					? splitValue
					: splitValue.includes("/")
					? splitValue
					: `R% ${splitValue}`
		  } antecipado e o valor restante ${
				splitRemaining === "remaining"
					? "após a conclusão do serviço"
					: `dividido em ${splitRemaining?.replace(
							" x",
							""
					  )} parcelas`
		  }`
		: "À vista";

export async function getPDFString(
	data: BusinessData,
	order: OrderModel,
	products: ProductModel[],
	materials: MaterialModel[],
	client: CostumerModel,
	validity: string,
	config: Config
) {
	const ordersTypes = products?.map((product) => product.types).flat();

	const productsTotal =
		products &&
		products
			?.map((product) => product.price * product.amount)
			.reduce((a, b) => a + b, 0);
	const materialsTotal =
		materials &&
		materials
			?.map((material) => material.price * material.amount)
			.reduce((a, b) => a + b, 0);

	const serviceDateAfterValidity = new Date();
	serviceDateAfterValidity.setDate(
		serviceDateAfterValidity.getDate() + parseInt(validity)
	);

	const title = config.showInvoiceName
		? `Orçamento - ${order?.name}`
		: "Orçamento";

	const image = data.logo
		? await manipulateAsync(data.logo!, [], { base64: true })
		: null;
	const digitalSignature = data.digitalSignatureUri
		? await manipulateAsync(data.digitalSignatureUri!, [], { base64: true })
		: null;

	const materialImages = await Promise.all(
		materials?.map(async (material) => {
			if (material.image_url) {
				const image = await manipulateAsync(material.image_url, [], {
					base64: true,
				});
				return image.base64;
			}
		})
	);

	const splitGeocodedAddress = data.geocodedAddress?.split(", ");

	const geocodedAddressBeforeStreetNumber = splitGeocodedAddress
		? [splitGeocodedAddress[0], splitGeocodedAddress[1]]?.join(", ")
		: null;
	const geocodedAddressAfterStreetNumber = splitGeocodedAddress
		? splitGeocodedAddress.slice(2).join(", ")
		: null;

	const html = `
    <html>

    <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
			:root {
				font-size: 40%;
				/* 1rem = 10px */

				--title: #27272a;
				--title-2: var(--title);

				--text: #000000; /* bg-000000 */
				--text-light: #666666; /* bg-100 */

				--background-dark: #c4c4c4;
				--background: #e9e9e9;

				--gap: 2.5rem;
			}

			[data-theme="blue"] {
				--title: #ffffff;

				--text: #000000; /* bg-000000 */
				--text-light: #666666; /* bg-100 */

				--background-dark: #3b7ac7;
				--background: #809fff;
				--title-2: var(--background-dark);
			}

			[data-theme="green"] {
				--title: #ffffff;

				--text: #000000; /* bg-000000 */
				--text-light: #666666; /* bg-100 */

				--background-dark: #6cbe45;
				--background: #7feb4c;
				--title-2: var(--background-dark);
			}

			[data-theme="yellow"] {
				--title: #ffffff;

				--text: #000000; /* bg-000000 */
				--text-light: #666666; /* bg-100 */

				--background-dark: #e6f242;
				--background: #fffd80;
				--title-2: var(--background-dark);
			}

			[data-theme="purple"] {
				--title: #ffffff;

				--text: #000000; /* bg-000000 */
				--text-light: #666666; /* bg-100 */

				--background-dark: #753bc7;
				--background: #b780ff;
				--title-2: var(--background-dark);
			}

			[data-theme="red"] {
				--title: #ffffff;

				--text: #000000; /* bg-000000 */
				--text-light: #666666; /* bg-100 */

				--background-dark: #c73b3b;
				--background: #ff80a0;
				--title-2: var(--background-dark);
			}

			[data-theme="orange"] {
				--title: #ffffff;

				--text: #000000; /* bg-000000 */
				--text-light: #666666; /* bg-100 */

				--background-dark: #c76e3b;
				--background: #ffa680;
				--title-2: var(--background-dark);
			}

			[data-theme="orange"] {
				--title: #ffffff;

				--text: #000000; /* bg-000000 */
				--text-light: #666666; /* bg-100 */

				--background-dark: #c76e3b;
				--background: #ffa680;
				--title-2: var(--background-dark);
			}

			[data-theme="pink"] {
				--title: #ffffff;

				--text: #000000; /* bg-000000 */
				--text-light: #666666; /* bg-100 */

				--background-dark: #c73bbe;
				--background: #ea80ff;
				--title-2: var(--background-dark);
			}

			* {
				margin: 0;
				padding: 0;
				/* outline: 1px solid rgba(255, 0, 0, 0.1); */
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
				color: var(--title-2);
			}

			header .logo_mark {
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: space-between;
				gap: 1rem;
				width: 100%;
			}

			header .logo_mark img {
				height: 6rem;
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

			/* .contacts p {
				color: var(--title-2);
			}

			.contacts svg path {
				fill: var(--title-2);
			} */

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

				background: linear-gradient(
					90deg,
					var(--background-dark) 0%,
					var(--background-dark) 52.81%,
					rgba(196, 196, 196, 0) 100%
				);
				border-radius: 1px;
				gap: 1rem;
				padding: 1.5rem var(--gap);
			}

			main #main_header p:nth-child(1) {
				font-weight: 700;
				font-size: 2.8rem;
				line-height: 150%;
				color: var(--title);
			}

			main #main_header p:nth-child(2) {
				font-weight: 400;
				font-size: 1.2rem;
				line-height: 150%;
				color: var(--background);
				opacity: 50%;
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
				color: var(--text);
			}

			.section_description {
				font-weight: 400;
				font-size: 1.8rem;
				line-height: 125%;
				color: var(--text);
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
				background-color: var(--background-dark);
				border-radius: 1px;
			}

			section header p {
				display: flex;
				font-style: normal;
				font-weight: 700;
				font-size: 1.8rem;
				line-height: 150%;
				color: var(--title);
			}

			.description {
				display: flex;
				flex: 1;
			}

			.quantity {
				width: 10rem;
				display: flex;
				justify-content: flex-end;
			}

			.price {
				width: 15rem;
				display: flex;
				justify-content: flex-end;
			}

			.total {
				width: 10rem;
				display: flex;
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
				background-color: var(--background);
				border-radius: 1px;
			}

			.sub_sectionHeader p {
				display: flex;
				font-style: normal;
				font-weight: 600;
				font-size: 1.8rem;
				line-height: 150%;
				color: var(--title);
			}

			.item_row {
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: space-between;
				gap: 1rem;
				width: 100%;
				padding: 1rem var(--gap);

				vertical-align: top;
			}

			.item_row .description {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				justify-content: flex-start;
			}

			.item_row .info {
				display: flex;
				flex-direction: row;
				gap: 1rem;

				font-weight: 500;
				color: var(--text-light);
			}

			.item_row h3 {
				font-style: normal;
				font-weight: 700;
				font-size: 1.8rem;
				line-height: 150%;
				color: var(--text);
			}

			.item_row h4 {
				font-style: normal;
				font-weight: 500;
				font-size: 1.6rem;
				color: var(--text-light);
			}

			.quantity p,
			.price p {
				font-weight: 500;
				font-size: 1.8rem;
				color: var(--text-light);
			}

			.total p {
				font-weight: 700;
				font-size: 1.8rem;
				color: var(--title-2);
			}

			.item_row:not(:nth-child(1)) {
				justify-content: flex-end;
				text-align: end;
			}

			.line {
				display: flex;
				width: 100%;
				height: 1px;
				background-color: var(--text-light);
				opacity: 50%;
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
				background-color: var(--background);
				border-radius: 1px;
				align-self: flex-end;
			}

			.subtotal p {
				font-weight: 600;
				font-size: 1.8rem;
				line-height: 150%;
				color: var(--title);
			}

			.earnings_total {
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: space-between;
				gap: 1rem;
				width: 100%;
				padding: 1rem var(--gap);
				background-color: var(--background);
				border-radius: 1px;
			}

			.earnings_total p {
				font-weight: 700;
				font-size: 1.8rem;
				line-height: 150%;
				color: var(--title);
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
				background-color: var(--background);
				border-radius: 1px;
			}

			.payment_info p {
				font-weight: 400;
				font-size: 1.8rem;
				color: var(--title);
			}

			.payment_info span {
				font-weight: bold;
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

			.signature div:nth-child(1) {
				width: 65%;
				height: 1px;
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
                ${
					data.logo && config.showLogo
						? `
                    <img
                        style="max-height: 125; object-fit: contain;"
                        src="data:image/jpeg;base64,${image!.base64}"
                    />
                `
						: ""
				}
                    <h1>${data.fantasyName}</h1>
            </div>
            <div class="row full">
                <address style="width: 50%;">
                    <p>${data.juridicalPerson}</p>
                    <p>${
						data.geocodedAddress
							? `${geocodedAddressBeforeStreetNumber}${
									data.address ? `, ${data.address}` : ""
							  }, ${geocodedAddressAfterStreetNumber}`
							: data.address
							? data.address
							: ""
					} </p>
                    <p>    
                        CEP ${data.postalCode}
                    </p>
                </address>
                <address>
                    ${
						data.email
							? `<div class="row">
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
                    </div>`
							: ""
					}
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
                    ${
						data.phone2
							? `<div class="row">
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
							: ""
					}
                </address>
            </div>
        </header>

        <main>
            <header id="main_header">
                <p>${title}</p>
                <p>#${order?.id}</p>
            </header>

            <section class="full">
                <div class="row">
                    ${
						order?.client && order.client.id
							? `
                    <div class="column">
                        <p class="section_title">Cliente: ${client?.name}</p>
                        ${
							client?.address &&
							`<p class="section_description">${client?.address}</p>`
						}
                    </div>`
							: ""
					}
                    <div class="column">
                        <p class="section_title">Data e horário da visita técnica</p>
                        <p class="section_description">${order.date.toLocaleDateString(
							"pt-BR",
							{
								day: "2-digit",
								month: "2-digit",
								year: "numeric",
							}
						)} - ${order.date.toLocaleTimeString("pt-BR", {
		hour: "2-digit",
		minute: "2-digit",
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
				<div class="subsection">
					<div class="sub_sectionHeader">
						<p>Serviços</p>
					</div>
					${
						products && products.length > 0
							? products.map(
									(product) => `
                            <div class="full">
                                <div class="item_row">
                                    <div
                                        style="
                                            display: flex;
                                            flex-direction: row;
                                            align-items: center;
                                            justify-content: flex-start;
                                            gap: 2.5rem;
                                        "
                                    >
                                        <div class="description">
                                            <h3>${product.description}</h3>
                                            ${
												product.details
													? `<h4>${product.details}</h4>`
													: ""
											}
                                        </div>
                                    </div>
                                    <div class="info">
                                        <div class="quantity">
                                            <p>${product.amount}</p>
                                        </div>
                                        <div class="price">
                                            <p>${
												product.price &&
												product.price > 0
													? `R$ ${product.price}`
													: "-"
											}</p>
                                        </div>
                                        <div class="total">
                                            <p>${
												product.price &&
												product.price > 0
													? `R$ ${
															product.price *
															product.amount
													  }`
													: "-"
											}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            `
							  )
							: ""
					}
                                    }
					<div class="line"></div>
					<div class="subtotal">
						<p>Subtotal</p>
						<p>R$ ${productsTotal}</p>
					</div>
				</div>

                /* MATERIAIS */

                <div class="subsection">
					<div class="sub_sectionHeader">
						<p>Materiais</p>
					</div>
					${
						materials && materials.length > 0
							? materials.map(
									(material, index) => `
                            <div class="full">
                                <div class="item_row">
                                    <div
                                        style="
                                            display: flex;
                                            flex-direction: row;
                                            align-items: center;
                                            justify-content: flex-start;
                                            gap: 2.5rem;
                                        "
                                    >
                                        ${
											material.image_url
												? `
                                                <img
                                                    src="${materialImages[index]}"
                                                    style="
                                                        height: 100%;
                                                        max-width: 10rem;
                                                        min-height: 10rem;
                                                        object-fit: contain;
                                                        border-radius: 1rem;
                                                    "
                                                />
                                            `
												: ""
										}
                                        <div class="description">
                                            <h3>${material.name}</h3>
                                            ${
												material.description
													? `<h4>${material.description}</h4>`
													: ""
											}
                                        </div>
                                    </div>
                                    <div class="info">
                                        <div class="quantity">
                                            <p>${material.amount}</p>
                                        </div>
                                        <div class="price">
                                            <p>${
												material.price &&
												material.price > 0
													? `R$ ${material.price}`
													: "-"
											}</p>
                                        </div>
                                        <div class="total">
                                            <p>${
												material.price &&
												material.price > 0
													? `R$ ${
															material.price *
															material.amount
													  }`
													: "-"
											}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            `
							  )
							: ""
					}
                                    }
					<div class="line"></div>
					<div class="subtotal">
						<p>Subtotal</p>
						<p>R$ ${materialsTotal}</p>
					</div>
				</div>
			</section>

			<div class="earnings_total">
				<p>Total</p>
				<p>R$ ${materialsTotal + productsTotal}</p>
			</div>

			<section class="full">
				<header>
					<p>Pagamento</p>
				</header>
				<div class="row">
					<div class="column">
						<p class="section_title">Condições de Pagamento</p>
						<p class="section_description">
							Acordo de 50% e o valor restante após a conclusão
						</p>
					</div>
					<div class="column">
						<p class="section_title">Meios de Pagamento</p>
						<p class="section_description">
							Transferência bancária, dinheiro ou pix
						</p>
					</div>
				</div>
				<div
					class="row"
					style="justify-content: flex-start; gap: var(--gap)"
				>
					<div class="payment_info">
						<p><span>Conta Corrente:</span> 63945-5</p>
						<p><span>Agência:</span> 6101</p>
						<p><span>Banco:</span> Itaú</p>
					</div>
					<div class="payment_info">
						<p><span>PIX:</span> andserv.maceio@gmail.com</p>
					</div>
				</div>
			</section>

            <div class="earnings_total">
                <p>Total</p>
                <p>R$ ${
					productsTotal
						? productsTotal
						: 0 + (materialsTotal ? materialsTotal : 0)
				}</p>
            </div>

            <section class="full">
                <header>
                    <p>Pagamento</p>
                </header>
                <div class="row">
                    <div class="column">
                        <p class="section_title">Condições de Pagamento</p>
                        <p class="section_description">${getPaymentCondition(
							order.paymentCondition,
							order.splitValue,
							order.splitRemaining
						)}</p>
                    </div>
                    ${
						order.paymentMethods.length > 0
							? `<div class="column">
                        <p class="section_title">Meios de Pagamento</p>
                        <p class="section_description">${order.paymentMethods.join(
							", "
						)}</p>
                    </div>`
							: ""
					}
                </div>
                ${
					data.pixKey ||
					(data.bank &&
						data.bankAccountType &&
						data.account &&
						data.agency)
						? `<div class="row" style="justify-content: flex-start; gap: var(--gap);">
                    ${
						data.bank
							? `<div class="payment_info">
                        <p><span>Conta Corrente:</span> ${data.account}</p>
                        <p><span>Agência:</span> ${data.agency}</p>
                        <p><span>Banco:</span> ${data.bank}</p>
                    </div>`
							: ""
					}
                    ${
						data.pixKey
							? `<div class="payment_info">
                        <p><span>PIX:</span> ${data.pixKey}</p>
                    </div>`
							: ""
					}
                </div>`
						: ""
				}
            </section>

            <section class="full">
                <header>
                    <p>Garantia</p>
                </header>
                <div class="row">
                    <div class="column" style="min-width: 25%;">
                        <p class="section_title">Período de Garantia</p>
                        <p class="section_description">${
							order.warrantyPeriod
						} dias</p>
                    </div>
                    ${
						order.warrantyDetails &&
						`
                        <div class="column">
                        <p class="section_title">Condições da Garantia</p>
                        <p class="section_description">${order.warrantyDetails}</p>
                        </div>
                    `
					}
                </div>
            </section>

            ${
				order.additionalInfo &&
				order.additionalInfo.length > 0 &&
				`<section class="full">
                <header>
                    <p>Garantia</p>
                </header>
                <div class="row">
                    <div class="column" style="min-width: 25%;">
                        <p class="section_title">Período de Garantia</p>
                        <p class="section_description">${
							order.warrantyPeriod
						} dias</p>
                    </div>
                    ${
						order.warrantyDetails &&
						`
                        <div class="column">
                        <p class="section_title">Condições da Garantia</p>
                        <p class="section_description">${order.warrantyDetails}</p>
                        </div>
                    `
					}
                </div>
            </section>`
			}

            <p id="date">${
				data.geocodedAddress
					? `${data.geocodedAddress.split(", ")[3]},`
					: ""
			} ${new Date().toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	})}</p>

            <div class="signature">
                ${
					data.digitalSignatureUri && config.showDigitalSignature
						? `
                    <img
                        style="width: 100%; height: 50; object-fit: contain; filter: invert(); z-index: -1; margin-bottom: -2rem;"
                        src="data:image/png;base64,${digitalSignature!.base64}"
                    />
                `
						: ""
				}
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
                        <p class="section_description">${serviceDateAfterValidity.toLocaleDateString(
							"pt-BR",
							{
								day: "numeric",
								month: "long",
								year: "numeric",
							}
						)}</p>
                    </div>

                    ${
						ordersTypes.length > 0
							? `<div class="column" style="min-width: 25%;">
                        <p class="section_title">Categorias</p>
                        <p class="section_description">${ordersTypes
							?.map((type) => type.name)
							.join(", ")}</p>
                    </div>`
							: ""
					}
                </div>

                <div class="full" style="display: flex; height: 1px; background-color: var(--text-100);">

                </div>

                ${
					image
						? `<img
					src="${image?.base64}"
					style="
						width: 100vw;
						height: 100vh;
						object-fit: contain;
						z-index: -1;
						position: absolute;
						top: 50%;
						left: 50%;
						transform: translate(-50%, -50%);
						opacity: 0.05;
					"
				/>`
						: ""
				}
            </footer>
        </main>
    </body>

    </html>
    `;
	return html;
}
