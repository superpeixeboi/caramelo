module "customers_flows" {
  source = "../../modules/lambda"

  function_name = "customers-flows"
  source_dir    = "${path.module}/../../../apps/customersFlows"
  handler       = "src/handler.handler"
  runtime       = "nodejs20.x"
  memory_size   = 128
  timeout       = 30

  environment_variables = {
    API_BASE_URL             = "https://api.caramelo.com/api"
    WHATSAPP_PHONE_NUMBER_ID = var.whatsapp_phone_number_id
    WHATSAPP_ACCESS_TOKEN    = var.whatsapp_access_token
    WHATSAPP_VERIFY_TOKEN    = var.whatsapp_verify_token
  }

  tags = {
    Service = "customers-flows"
  }
}
