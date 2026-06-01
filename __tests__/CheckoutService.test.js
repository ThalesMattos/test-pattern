import { CheckoutService } from '../src/services/CheckoutService.js';
import { Item } from '../src/domain/Item.js';
import { Pedido } from '../src/domain/Pedido.js';
import { UserMother } from './builders/UserMother.js';
import { CarrinhoBuilder } from './builders/CarrinhoBuilder.js';

// ---------------------------------------------------------------------------
// Etapa 4 – Padrão Stub (Verificação de Estado)
// ---------------------------------------------------------------------------
describe('quando o pagamento falha', () => {
  it('deve retornar null', async () => {
    // Arrange
    const carrinho = new CarrinhoBuilder().build();
    const cartaoCredito = { numero: '4111111111111111' };

    // Stub: simula falha no gateway – controla apenas o retorno
    const gatewayStub = { cobrar: jest.fn().mockResolvedValue({ success: false }) };

    // Dummies: dependências que não devem ser chamadas neste cenário
    const repositoryDummy = { salvar: jest.fn() };
    const emailDummy = { enviarEmail: jest.fn() };

    const checkoutService = new CheckoutService(gatewayStub, repositoryDummy, emailDummy);

    // Act
    const pedido = await checkoutService.processarPedido(carrinho, cartaoCredito);

    // Assert (Verificação de Estado)
    expect(pedido).toBeNull();
  });

  it('não deve persistir nem enviar e-mail quando o pagamento falha', async () => {
    // Arrange
    const carrinho = new CarrinhoBuilder().build();
    const cartaoCredito = { numero: '4111111111111111' };

    const gatewayStub = { cobrar: jest.fn().mockResolvedValue({ success: false }) };
    const repositoryDummy = { salvar: jest.fn() };
    const emailDummy = { enviarEmail: jest.fn() };

    const checkoutService = new CheckoutService(gatewayStub, repositoryDummy, emailDummy);

    // Act
    await checkoutService.processarPedido(carrinho, cartaoCredito);

    // Assert (Verificação de Estado)
    expect(repositoryDummy.salvar).not.toHaveBeenCalled();
    expect(emailDummy.enviarEmail).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Etapa 5 – Padrão Mock (Verificação de Comportamento)
// ---------------------------------------------------------------------------
describe('quando um cliente Premium finaliza a compra', () => {
  it('deve aplicar 10% de desconto e processar o pedido com sucesso', async () => {
    // Arrange
    const usuarioPremium = UserMother.umUsuarioPremium();
    const carrinho = new CarrinhoBuilder()
      .comUser(usuarioPremium)
      .comItens([new Item('Produto A', 100), new Item('Produto B', 100)])
      .build();

    const cartaoCredito = { numero: '4111111111111111' };
    const pedidoSalvo = new Pedido(42, carrinho, 180, 'PROCESSADO');

    // Stub: controla o retorno do gateway de pagamento
    const gatewayStub = { cobrar: jest.fn().mockResolvedValue({ success: true }) };

    // Stub: controla o retorno do repositório (retorna pedido com ID)
    const repositoryStub = { salvar: jest.fn().mockResolvedValue(pedidoSalvo) };

    // Mock: verificaremos se o e-mail foi enviado com os argumentos corretos
    const emailMock = { enviarEmail: jest.fn().mockResolvedValue(undefined) };

    const checkoutService = new CheckoutService(gatewayStub, repositoryStub, emailMock);

    // Act
    const resultado = await checkoutService.processarPedido(carrinho, cartaoCredito);

    // Assert (Verificação de Comportamento)

    // Verifica se o gateway foi chamado com o valor correto (R$ 200 - 10% = R$ 180)
    expect(gatewayStub.cobrar).toHaveBeenCalledWith(180, cartaoCredito);

    // Verifica se o e-mail foi disparado exatamente 1 vez
    expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);

    // Verifica os argumentos com que o e-mail foi enviado
    expect(emailMock.enviarEmail).toHaveBeenCalledWith(
      'premium@email.com',
      'Seu Pedido foi Aprovado!',
      expect.stringContaining('180')
    );

    // Verificação de Estado complementar: pedido retornado é o salvo
    expect(resultado).toBe(pedidoSalvo);
  });
});
