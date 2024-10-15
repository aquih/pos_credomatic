/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";

import { patch } from "@web/core/utils/patch";
import { ErrorPopup } from "@point_of_sale/app/errors/popups/error_popup";
import { useService } from "@web/core/utils/hooks";
import { SelectionPopup } from "@point_of_sale/app/utils/input_popups/selection_popup";
import { AnulacionReceipt } from "@pos_credomatic/app/anulacion_receipt";

patch(PaymentScreen.prototype, {
    async consultarPuntos() {
        var service = new ServiceProvider();
        var inquiry_data = "terminalId:"+this.pos.config.terminal_puntos_id+";transactionType:POINTS_INQUIRY;invoice:"+this.currentOrder.uid.replaceAll("-", "")+";pointsPlan:00";
        console.info(inquiry_data)
        var response = service.SdkInvoke(inquiry_data);
        response = '{"acqNumber":"","cardHolderName":"ARIANA CARRILLO","salesAmount":"000000050000","authorizationNumber":"0158533232329","cardBrand":"retail EMV","hostDate":"09232024","hostTime":"171346","invoice":"undefined","maskedCardNumber":"448796XXXXXX0125","referenceNumber":"17015859","responseCode":"00","responseCodeDescription":"APROBADA","systemTraceNumber":"067836","transactionId":"06783517015859050158","currencyVoucher":"GTQ","TerminalDisplayLine1Voucher":"TEST ISC480","TerminalDisplayLine2Voucher":"PRUEBAS INTEGRACUONED BAC","TerminalDisplayLine3Voucher":"ZONA 12","trnTotalTime":"37429"}1234'

        try {
            console.log('response', response)
            var string_to_parse = response.replace(/(\r\n|\r|\n)/g, '\\r\\n');
            string_to_parse = string_to_parse.substring(0, string_to_parse.length - 4);
            var json_response = JSON.parse(string_to_parse);
            console.info("json_response", json_response);
            return this.response_eval(json_response);
        } 
        catch(err){
            console.info("response with error", err);
            this.env.services.popup.add(ErrorPopup, {
                title: _t("No se pudo realizar la consulta"),
                body: _t("Respuesta del servicio: %s", response),
            });
            return;
        }
    },

    async response_eval(response){
        var response_code, response_description;
        if (response == false || (response['responseCode'] != '00' && response['responseCode'] != '08')){
            if (response['responseCode']){
                response_code = response['responseCode'];
                response_description = response['responseCodeDescription'];
            }else{
                response_code = '';
                response_description = 'Error de conexión.';
            }
            this.env.services.popup.add(ErrorPopup, {
                title: _t("No se pudo realizar la consulta de puntos: %s", response_code),
                body: _t("%s", response_description),
            });
            return;

        }else{
            this.env.services.popup.add(ErrorPopup, {
                title: _t("Puntos acumulados para %s", response['cardHolderName']),
                body: _t("Puntos acumulados: %s", response['salesAmount']),
            });
            return true;
        }
    }
});