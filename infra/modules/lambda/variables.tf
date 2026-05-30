variable "function_name" {
  type = string
}

variable "source_dir" {
  type = string
}

variable "handler" {
  type    = string
  default = "handler.handler"
}

variable "runtime" {
  type    = string
  default = "nodejs20.x"
}

variable "environment_variables" {
  type    = map(string)
  default = {}
}

variable "memory_size" {
  type    = number
  default = 128
}

variable "timeout" {
  type    = number
  default = 30
}

variable "tags" {
  type    = map(string)
  default = {}
}
