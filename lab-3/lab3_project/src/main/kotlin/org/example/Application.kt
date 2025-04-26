package org.example

import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.application.*
import io.ktor.server.html.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.html.*

fun main() {
    embeddedServer(Netty, port = 8080) {
        routing {
            get("/") {
                call.respondHtml {
                    body {
                        form(action = "/servlet", method = FormMethod.post) {
                            p { +"The following document is available to you:" }
                            submitInput { value = "Request" }
                        }
                    }
                }
            }
            post("/servlet") {
                call.respondText(TextPage.getPage(), contentType = io.ktor.http.ContentType.Text.Html)
            }
        }
    }.start(wait = true)
}