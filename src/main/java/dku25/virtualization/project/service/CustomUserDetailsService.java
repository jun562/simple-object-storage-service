package dku25.virtualization.project.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import dku25.virtualization.project.domain.User;
import dku25.virtualization.project.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService{
  
  @Autowired
  private UserRepository userRepository;

  @Override
  public UserDetails loadUserByUsername(String username){
    User user = userRepository.findByUsername(username)
    .orElseThrow(() -> new UsernameNotFoundException("사용자 없음"));
    return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(), List.of(new SimpleGrantedAuthority("ROLE_USER")));
  }
}
