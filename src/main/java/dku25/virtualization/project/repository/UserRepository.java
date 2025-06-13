package dku25.virtualization.project.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import dku25.virtualization.project.domain.User;

public interface UserRepository extends JpaRepository<User, Long>{
  Optional<User> findByUsername(String username);
}
