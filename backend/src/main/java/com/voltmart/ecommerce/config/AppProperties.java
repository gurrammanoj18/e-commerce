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
    private final Google google = new Google();
    private final Store store = new Store();
    private final Seed seed = new Seed();
    private final Whatsapp whatsapp = new Whatsapp();
    private final Email email = new Email();
    private final Msg91 msg91 = new Msg91();
    private final Cache cache = new Cache();

    @Getter
    @Setter
    public static class Jwt {
        private String secret;
        private long expiration;
    }

    @Getter
    @Setter
    public static class Cors {
        private List<String> allowedOrigins = List.of(
                "http://localhost:3000",
                "https://voltmart-frontend.onrender.com"
        );
    }

    @Getter
    @Setter
    public static class Google {
        private String clientId;
    }

    @Getter
    @Setter
    public static class Store {
        private String frontendUrl = "http://localhost:3000";
    }

    @Getter
    @Setter
    public static class Seed {
        private String adminEmail = "admin@voltmart.in";
        private String adminPassword = "Admin@123";
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
        private String provider = "smtp";
        private String fromAddress;
        private String fromName = "VoltMart";
        private String apiKey;
        private String apiUrl = "https://api.brevo.com/v3/smtp/email";
    }

    @Getter
    @Setter
    public static class Msg91 {
        private boolean enabled;
        private String authKey;
        private String templateId;
        private String countryCode = "91";
        private String baseUrl = "https://control.msg91.com";
    }

    @Getter
    @Setter
    public static class Cache {
        private boolean redisEnabled;
        private String host = "localhost";
        private int port = 6379;
        private long ttlSeconds = 300;
    }
}
