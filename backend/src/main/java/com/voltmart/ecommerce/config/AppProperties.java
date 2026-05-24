package com.voltmart.ecommerce.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@Getter
@Setter
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Jwt jwt = new Jwt();
    private final Cors cors = new Cors();
    private final Whatsapp whatsapp = new Whatsapp();
    private final Email email = new Email();

    @Getter
    @Setter
    public static class Jwt {
        private String secret;
        private long expiration;
    }

    @Getter
    @Setter
    public static class Cors {
        private List<String> allowedOrigins = List.of("http://localhost:3000");
    }

    @Getter
    @Setter
    public static class Whatsapp {
        private String supportNumber;
        private boolean enabled;
        private String apiVersion = "v25.0";
        private String phoneNumberId;
        private String accessToken;
    }

    @Getter
    @Setter
    public static class Email {
        private boolean enabled;
        private String fromAddress;
        private String fromName = "VoltMart";
    }
}
