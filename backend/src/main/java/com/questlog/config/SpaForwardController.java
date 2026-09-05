package com.questlog.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

    /**
     * Forward single-page application routes to index.html
     * Excludes /api/**, /h2-console/**, and static resource paths (containing a dot like .js, .css)
     */
    @GetMapping(value = {
        "/",
        "/dashboard",
        "/calendar",
        "/onboarding",
        "/{path:[^\\.]*}"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
