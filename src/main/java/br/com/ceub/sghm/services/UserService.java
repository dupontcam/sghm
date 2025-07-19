package br.com.ceub.sghm.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import br.com.ceub.sghm.entities.Role;
import br.com.ceub.sghm.entities.User;
import br.com.ceub.sghm.projections.UserDetailsProjection;
import br.com.ceub.sghm.repositories.UserRepository;

public class UserService implements UserDetailsService {

  @Autowired
  private UserRepository repository;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    
    List<UserDetailsProjection> result = repository.searchUserAndRolesByEmail(username);
    if (result.size() == 0) {
      throw new UsernameNotFoundException("User not found with email: " + username);
    }

    User user = new User();
    user.setEmail(username);
    user.setPassword(result.get(0).getPassword());
    for (UserDetailsProjection projection : result) {
      user.addRole(new Role(projection.getRoleId(), projection.getAuthority()));
    }
    return user;
  }
}
