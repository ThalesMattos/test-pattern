import { Carrinho } from '../../src/domain/Carrinho.js';
import { Item } from '../../src/domain/Item.js';
import { UserMother } from './UserMother.js';

/**
 * Data Builder para a entidade Carrinho.
 * Permite criar carrinhos complexos de forma fluente e customizável.
 */
export class CarrinhoBuilder {
  constructor() {
    // Valores padrão: usuário padrão com 1 item
    this._user = UserMother.umUsuarioPadrao();
    this._itens = [new Item('Produto Padrão', 100)];
  }

  comUser(user) {
    this._user = user;
    return this;
  }

  comItens(itens) {
    this._itens = itens;
    return this;
  }

  vazio() {
    this._itens = [];
    return this;
  }

  build() {
    return new Carrinho(this._user, this._itens);
  }
}
