import { User } from '../../src/domain/User.js';

/**
 * Object Mother para a entidade User.
 * Fornece instâncias prontas e fixas para uso nos testes.
 */
export class UserMother {
  static umUsuarioPadrao() {
    return new User(1, 'João Silva', 'joao@email.com', 'PADRAO');
  }

  static umUsuarioPremium() {
    return new User(2, 'Maria Premium', 'premium@email.com', 'PREMIUM');
  }
}
