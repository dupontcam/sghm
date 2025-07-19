package br.com.ceub.sghm.projections;

public interface UserDetailsProjection {

  String getUsername();
	String getPassword();
	Long getRoleId();
	String getAuthority();
}
