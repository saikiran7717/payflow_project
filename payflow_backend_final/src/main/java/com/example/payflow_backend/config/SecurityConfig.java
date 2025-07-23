package com.example.payflow_backend.config;

import com.example.payflow_backend.security.CustomAdminDetailsService;
import com.example.payflow_backend.security.CustomEmployeeDetailsService;
import com.example.payflow_backend.security.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Autowired
    private final CustomAdminDetailsService adminDetailsService;
    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Bean
    public DaoAuthenticationProvider adminAuthProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(adminDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public DaoAuthenticationProvider userAuthProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Autowired
    private CustomEmployeeDetailsService employeeDetailsService;

    @Bean
    public DaoAuthenticationProvider employeeAuthProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(employeeDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }



    public SecurityConfig(CustomAdminDetailsService adminDetailsService) {
        this.adminDetailsService = adminDetailsService;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/admins/login",
                                "/api/admins/register",
                                "/api/users/login"
                        ).permitAll()
                        .requestMatchers(
                                "/api/users/register",
                                "/api/admins/me",
                                "/api/admins/logout"
                        ).hasRole("ADMIN")
                        .requestMatchers(
                                "/api/users/me",
                                "/api/users/logout",
                                "/api/employees/add"  // ✅ Only HR & Manager
                        ).hasAnyRole("MANAGER", "HR")
                        .requestMatchers("/api/employees/login").permitAll()
                        .requestMatchers("/api/employees/me", "/api/employees/logout", "/api/employees/reset-password").hasRole("EMPLOYEE")
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .maximumSessions(1)
                        .maxSessionsPreventsLogin(false)
                )
                .logout(logout -> logout
                        .logoutUrl("/api/admins/logout")
                        .logoutSuccessHandler((request, response, authentication) -> response.setStatus(200))
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                )
                .logout(logout -> logout
                        .logoutUrl("/api/users/logout")
                        .logoutSuccessHandler((request, response, authentication) -> response.setStatus(200))
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                )
                .logout(logout -> logout
                        .logoutUrl("/api/employees/logout")
                        .logoutSuccessHandler((request, response, authentication) -> response.setStatus(200))
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                )


                .httpBasic(httpBasic -> httpBasic.disable())
                .formLogin(form -> form.disable()); // Keep forms disabled

        return http.build();
    }



    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder builder = http.getSharedObject(AuthenticationManagerBuilder.class);
        builder.authenticationProvider(adminAuthProvider());
        builder.authenticationProvider(userAuthProvider());
        builder.authenticationProvider(employeeAuthProvider()); // ✅ Add this
        return builder.build();
    }

}
