package dku25.virtualization.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import dku25.virtualization.project.domain.FileMeta;

public interface FileMetaRepository extends JpaRepository<FileMeta, Long> {
    Optional<FileMeta> findByLinkId(String linkId);
    List<FileMeta> findAllByUsername(String username);
}
