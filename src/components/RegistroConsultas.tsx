import React, { useState } from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal'; // 1. Importar
import { useData } from '../contexts/DataContext';
import { Consulta, Medico, Paciente } from '../data/mockData';
import './Formulario.css';
import './RegistroConsultas.css';

const formInicial: Omit<Consulta, 'id'> = {
  usuarioInclusao: '',
  dataInclusao: '',
  usuarioAlteracao: '',
  dataAlteracao: '',
  status: 'Pendente',
  pacienteId: 0,
  protocolo: '',
  consultorio: '',
  tipoLocal: '',
  tipoPagamento: '',
  medicoId: 0,
  dataConsulta: '',
  especialidade: '',
  valorProcedimento: 0,
  descricaoProcedimento: '',
  valorRecebido: undefined,
  dataRecebimento: undefined,
  planoSaudeId: undefined,
  numeroCarteirinha: undefined,
};

const RegistroConsultas: React.FC = () => {
  const { 
    consultas, addConsulta, addConsultaComHonorario, updateConsulta, deleteConsulta, 
    medicos, pacientes, planosSaude 
  } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Omit<Consulta, 'id'> | Consulta>(formInicial);

  // 2. Estado para o modal de confirmação
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });

  const getPacienteNome = (id: number) => pacientes.find((p: Paciente) => p.id === id)?.nome || 'Não encontrado';
  const getMedicoNome = (id: number) => medicos.find((m: Medico) => m.id === id)?.nome || 'Não encontrado';

  const handleNovaConsulta = () => {
    setIsEditing(false);
    setFormData({
        ...formInicial,
    });
    setIsModalOpen(true);
  };

  const handleEditarConsulta = (consulta: Consulta) => {
    setIsEditing(true);
    
    // Formata a data para o formato YYYY-MM-DD esperado pelo input type="date"
    const dataFormatada = consulta.dataConsulta.split('T')[0];
    
    setFormData({
        ...consulta,
        dataConsulta: dataFormatada,
        usuarioAlteracao: 'admin@sghm.com',
        dataAlteracao: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 3. Abrir o modal de confirmação
  const handleExcluirClick = (id: number) => {
    setConfirmState({ isOpen: true, id: id });
  };

  // 4. Ação de confirmar
  const handleConfirmarExclusao = () => {
    if (confirmState.id !== null) {
      deleteConsulta(confirmState.id);
    }
    setConfirmState({ isOpen: false, id: null });
  };

  // 5. Ação de fechar o modal de confirmação
  const handleCloseConfirm = () => {
    setConfirmState({ isOpen: false, id: null });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let valorProcessado: string | number = value;

    if (name === 'valorProcedimento' || name === 'pacienteId' || name === 'medicoId' || name === 'valorRecebido') {
      valorProcessado = parseFloat(value) || 0;
    }

    const novoFormData: any = {
      ...formData,
      [name]: valorProcessado,
    };

    // Se selecionar um paciente, armazena os dados do convênio
    if (name === 'pacienteId' && value) {
      const pacienteSelecionado = pacientes.find((p: Paciente) => p.id === parseInt(value));
      if (pacienteSelecionado) {
        novoFormData.numeroCarteirinha = pacienteSelecionado.carteirinha || '';
        
        // Se o paciente tem convênio, tenta encontrar o plano correspondente
        if (pacienteSelecionado.convenio) {
          const planoEncontrado = planosSaude.find(p => 
            p.nome.toLowerCase().includes(pacienteSelecionado.convenio.toLowerCase()) ||
            pacienteSelecionado.convenio.toLowerCase().includes(p.nome.toLowerCase())
          );
          if (planoEncontrado) {
            novoFormData.planoSaudeId = planoEncontrado.id;
          }
        }
      }
    }

    // Se selecionar um médico, preenche automaticamente a especialidade
    if (name === 'medicoId' && value) {
      const medicoSelecionado = medicos.find((m: Medico) => m.id === parseInt(value));
      if (medicoSelecionado) {
        novoFormData.especialidade = medicoSelecionado.especialidade;
      }
    }

    // Se mudar o tipo de pagamento
    if (name === 'tipoPagamento') {
      if (value === 'convenio') {
        // Ao selecionar convênio, mantém o plano já identificado pelo paciente
        novoFormData.status = 'Pendente';
        novoFormData.valorRecebido = undefined;
        novoFormData.dataRecebimento = undefined;
        
        // Se ainda não tem plano vinculado, tenta buscar pelo paciente
        if (!novoFormData.planoSaudeId && novoFormData.pacienteId) {
          const pacienteSelecionado = pacientes.find((p: Paciente) => p.id === novoFormData.pacienteId);
          if (pacienteSelecionado?.convenio) {
            const planoEncontrado = planosSaude.find(p => 
              p.nome.toLowerCase().includes(pacienteSelecionado.convenio.toLowerCase()) ||
              pacienteSelecionado.convenio.toLowerCase().includes(p.nome.toLowerCase())
            );
            if (planoEncontrado) {
              novoFormData.planoSaudeId = planoEncontrado.id;
            }
          }
        }
      } else if (value === 'particular') {
        // Pagamento particular
        if (!isEditing) {
          novoFormData.status = 'Pago';
          novoFormData.valorRecebido = formData.valorProcedimento || 0;
          novoFormData.dataRecebimento = formData.dataConsulta || new Date().toISOString().split('T')[0];
        }
        // Limpa o plano de saúde em pagamento particular
        novoFormData.planoSaudeId = null;
      }
    }

    // Se mudar status para Pago, preenche campos de pagamento
    if (name === 'status' && value === 'Pago') {
      novoFormData.valorRecebido = novoFormData.valorRecebido || formData.valorProcedimento || 0;
      novoFormData.dataRecebimento = novoFormData.dataRecebimento || new Date().toISOString().split('T')[0];
    }

    setFormData(novoFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dadosFormatados = {
        ...formData,
        status: formData.status as Consulta['status'],
        tipoPagamento: formData.tipoPagamento as Consulta['tipoPagamento'],
        valorProcedimento: Number(formData.valorProcedimento)
    };

    if (isEditing) {
      const consultaAtualizada = {
          ...dadosFormatados,
          usuarioAlteracao: 'admin@sghm.com',
          dataAlteracao: new Date().toISOString()
      } as Consulta; 

      try {
        await updateConsulta(consultaAtualizada);
        closeModal();
      } catch (error) {
        console.error('Erro ao atualizar consulta:', error);
        alert('Erro ao atualizar consulta. Verifique o console para mais detalhes.');
        return;
      }
      
    } else {
      const novaConsulta = {
          ...dadosFormatados,
          usuarioInclusao: 'operador@sghm.com',
          dataInclusao: new Date().toISOString(),
          usuarioAlteracao: 'operador@sghm.com',
          dataAlteracao: new Date().toISOString(),
      } as Omit<Consulta, 'id'>; 

      // Usar a nova função que cria honorário automaticamente
      try {
        await addConsultaComHonorario(novaConsulta);
        closeModal();
      } catch (error) {
        console.error('Erro ao criar consulta:', error);
        alert('Erro ao criar consulta. Verifique o console para mais detalhes.');
      }
    }
  };


  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Registro de Consultas</h1>
        <button className="btn btn-primary" onClick={handleNovaConsulta}>
          + Nova Consulta
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Protocolo</th>
              <th>Paciente</th>
              <th>Médico</th>
              <th>Data</th>
              <th>Valor (R$)</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {consultas.map((consulta) => (
              <tr key={consulta.id}>
                <td>{consulta.protocolo}</td>
                <td>{getPacienteNome(consulta.pacienteId)}</td>
                <td>{getMedicoNome(consulta.medicoId)}</td>
                <td>{new Date(consulta.dataConsulta).toLocaleDateString()}</td>
                <td>{consulta.valorProcedimento.toFixed(2)}</td>
                <td>
                  <span className={`status-badge status-${consulta.status.toLowerCase()}`}>
                    {consulta.status}
                  </span>
                </td>
                <td>
                  <button className="btn-icon" title="Editar" onClick={() => handleEditarConsulta(consulta)}>
                    <FaEdit />
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    title="Excluir"
                    onClick={() => handleExcluirClick(consulta.id)} // 6. Chamar o clique
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? 'Editar Consulta' : 'Nova Consulta'}>
        <form onSubmit={handleSubmit} className="form-modal">
          
          {isEditing && (
            <fieldset>
              <legend>Dados de Auditoria</legend>
              <div className="form-row">
                <div className="form-group half-width">
                  <label>ID da Consulta</label>
                  <input type="text" value={'id' in formData ? formData.id : ''} disabled />
                </div>
                <div className="form-group half-width">
                  <label>Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Pago">Pago</option>
                    <option value="Glosado">Glosado</option>
                  </select>
                </div>
              </div>
              {'id' in formData && ( 
                <>
                  <div className="form-row">
                    <div className="form-group half-width">
                      <label>Usuário Inclusão</label>
                      <input type="text" value={formData.usuarioInclusao} disabled />
                    </div>
                    <div className="form-group half-width">
                      <label>Data Inclusão</label>
                      <input type="text" value={new Date(formData.dataInclusao).toLocaleString()} disabled />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group half-width">
                      <label>Usuário Alteração</label>
                      <input type="text" value={formData.usuarioAlteracao} disabled />
                    </div>
                    <div className="form-group half-width">
                      <label>Data Alteração</label>
                      <input type="text" value={new Date(formData.dataAlteracao).toLocaleString()} disabled />
                    </div>
                  </div>
                </>
              )}
            </fieldset>
          )}

          <fieldset>
            <legend>Dados da Consulta</legend>
            <div className="form-row">
                <div className="form-group half-width">
                    <label htmlFor="pacienteId">Nome do Paciente</label>
                    <select
                        id="pacienteId"
                        name="pacienteId"
                        value={formData.pacienteId}
                        onChange={handleChange}
                        required
                    >
                        <option value={0} disabled>Selecione...</option>
                        {pacientes.map((p: Paciente) => (
                            <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group half-width">
                    <label htmlFor="protocolo">Protocolo</label>
                    <input
                        id="protocolo"
                        name="protocolo"
                        type="text"
                        value={formData.protocolo}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group half-width">
                    <label htmlFor="tipoLocal">Tipo de Local</label>
                    <select
                        id="tipoLocal"
                        name="tipoLocal"
                        value={(formData as any).tipoLocal || ''}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>Selecione...</option>
                        <option value="Clínica Particular">Clínica Particular</option>
                        <option value="Hospital Particular">Hospital Particular</option>
                        <option value="Hospital Público (SUS)">Hospital Público (SUS)</option>
                    </select>
                </div>
                <div className="form-group half-width">
                    <label htmlFor="consultorio">Nome do Estabelecimento</label>
                    <input
                        id="consultorio"
                        name="consultorio"
                        type="text"
                        value={formData.consultorio}
                        onChange={handleChange}
                        placeholder="Ex: Hospital Santa Lúcia, Clínica Dr. Silva..."
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group half-width">
                    <label htmlFor="tipoPagamento">Tipo de Pagamento</label>
                    <select
                        id="tipoPagamento"
                        name="tipoPagamento"
                        value={formData.tipoPagamento}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>Selecione...</option>
                        <option value="particular">Particular</option>
                        <option value="convenio">Convênio</option>
                    </select>
                </div>
                <div className="form-group half-width">
                    <label htmlFor="medicoId">Médico</label>
                    <select
                        id="medicoId"
                        name="medicoId"
                        value={formData.medicoId}
                        onChange={handleChange}
                        required
                    >
                        <option value={0} disabled>Selecione...</option>
                        {medicos.map((m: Medico) => (
                            <option key={m.id} value={m.id}>{m.nome}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group half-width">
                    <label htmlFor="dataConsulta">Data da Consulta</label>
                    <input
                        id="dataConsulta"
                        name="dataConsulta"
                        type="date"
                        value={formData.dataConsulta}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group half-width">
                    <label htmlFor="especialidade">Especialidade</label>
                    <input
                        id="especialidade"
                        name="especialidade"
                        type="text"
                        value={formData.especialidade}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group half-width">
                    <label htmlFor="valorProcedimento">Valor do Procedimento (R$)</label>
                    <input
                        id="valorProcedimento"
                        name="valorProcedimento"
                        type="number"
                        step="0.01"
                        value={formData.valorProcedimento}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="descricaoProcedimento">Descrição do Procedimento</label>
                <textarea
                    id="descricaoProcedimento"
                    name="descricaoProcedimento"
                    rows={3}
                    value={formData.descricaoProcedimento}
                    onChange={handleChange}
                ></textarea>
            </div>
          </fieldset>

          {/* Mostrar campos de pagamento quando status for Pago */}
          {formData.status === 'Pago' && (
            <fieldset>
              <legend>Dados de Pagamento</legend>
              <div className="form-row">
                <div className="form-group half-width">
                  <label htmlFor="valorRecebido">Valor Recebido (R$)</label>
                  <input
                    id="valorRecebido"
                    name="valorRecebido"
                    type="number"
                    step="0.01"
                    value={formData.valorRecebido || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group half-width">
                  <label htmlFor="dataRecebimento">Data de Recebimento</label>
                  <input
                    id="dataRecebimento"
                    name="dataRecebimento"
                    type="date"
                    value={formData.dataRecebimento || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </fieldset>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? 'Salvar Alterações' : 'Salvar Consulta'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 7. Renderizar o modal de confirmação */}
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmarExclusao}
        title="Excluir Consulta"
        message="Tem certeza que deseja excluir este registro de consulta? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default RegistroConsultas;
