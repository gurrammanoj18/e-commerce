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
    private final SmsOtp smsOtp = new SmsOtp();
    private final Whatsapp whatsapp = new Whatsapp();
    private final Email email = new Email();
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
                "http://175.101.46.98",
                "https://eldoo.in",
                "https://www.eldoo.in"
        );
    }

    @Getter
    @Setter
    public static class Google {
        private String clientId;
        private String mapsApiKey;
    }

    @Getter
    @Setter
    public static class Store {
        private String frontendUrl = "http://175.101.46.98";
    }

    @Getter
    @Setter
    public static class SmsOtp {
        private boolean enabled;
        private String provider = "JIO_TRUECONNECT";
        private String requestUrl;
        private String authHeaderName = "Authorization";
        private String authHeaderValue;
        private String senderId;
        private String templateId;
        private String messageTemplate = "Your Eldoo OTP is {otp}. It is valid for {minutes} minutes.";
        private String requestBodyTemplate = "{\"mobile\":\"{phoneNumber}\",\"message\":\"{message}\",\"senderId\":\"{senderId}\",\"templateId\":\"{templateId}\"}";
    }

    @Getter
    @Setter
    public static class Seed {
        private String adminEmail = "admin@voltmart.in";
        private String adminPassword = "Admin@123";
        private boolean demoCatalogEnabled;
    }

    @Getter
    @Setter
    public static class Whatsapp {
        private String supportNumber;
        private boolean enabled;
        private String apiVersion = "v25.0";
        private String businessAccountId;
        private String phoneNumberId;
        private String accessToken;
        private String statusTemplateName = "custom_order_v2";
        private String statusTemplateLanguage = "en_IN";
        private String templateImageUrl = "https://eldoo.in/whatsapp-logo.png";
    }

    @Getter
    @Setter
    public static class Email {
        private boolean enabled;
        private String provider = "smtp";
        private String fromAddress;
        private String fromName = "Eldoo";
        private String apiKey;
        private String apiUrl = "https://api.brevo.com/v3/smtp/email";
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
