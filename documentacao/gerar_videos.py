#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Geração de Vídeos Tutoriais - Gestão de Materiais de Catenária
Automatiza: screenshots, narrativas, áudio TTS (PT-PT) e montagem de vídeos
"""

import os
import json
import subprocess
import sys
from pathlib import Path

# ============================================================================
# CONFIGURAÇÃO
# ============================================================================

BASE_URL = "http://localhost:8765"
VIDEOS_DIR = Path(__file__).parent / "videos"
SCRIPTS_DIR = Path(__file__).parent / "scripts_videos"
AUDIO_DIR = Path(__file__).parent / "audio_videos"

# Criar pastas necessárias
VIDEOS_DIR.mkdir(exist_ok=True)
SCRIPTS_DIR.mkdir(exist_ok=True)
AUDIO_DIR.mkdir(exist_ok=True)

# ============================================================================
# AS 12 SECÇÕES COM SCRIPTS DE NARRAÇÃO EM PORTUGUÊS (PT-PT)
# ============================================================================

SECOES = [
    {
        "id": 1,
        "titulo": "Início e Menu Lateral",
        "duracao": "2:30",
        "narrador": """
        Olá! Bem-vindo ao programa de Gestão de Materiais de Catenária da DTE.

        Nesta secção vamos explorar a tela inicial e o menu lateral.

        Na tela inicial, tem duas opções: Operador e Gestão.
        - A versão Operador é para quem está no armazém e precisa de ler QR codes e consultar stock.
        - A versão Gestão é para administrativos e engenherios que gerem compras, transferências e relatórios.

        No menu lateral, à esquerda, encontra as seguintes secções:

        Na zona de OBRAS, pode selecionar entre Vendas Novas e Pampilhosa.

        Cada obra tem dados independentes de stock e movimentos.

        Na zona de PROJETO, tem acesso aos postes, desenhos, materiais por poste e códigos de peças.

        Na zona de ARMAZÉM, estão todas as operações de stock: consultas, entradas, saídas, transferências.

        Na zona de GESTÃO, tem relatórios, encomendas, consumos e definições.

        No canto superior direito, tem botões para mudar o tema entre claro e escuro, fazer backup e restaurar dados.

        Isto permite guardar os seus dados em segurança em qualquer altura.
        """.strip(),
        "navegacao": [
            ("tela_inicial", "Tirar screenshot da tela de entrada"),
            ("menu_lateral_aberto", "Menu lateral expandido"),
            ("tema_claro", "Tema claro ativado"),
            ("tema_escuro", "Tema escuro ativado"),
            ("botoes_backup", "Botões de Backup e Restaurar destacados"),
        ]
    },
    {
        "id": 2,
        "titulo": "Stock - Consultar Materiais",
        "duracao": "3:00",
        "narrador": """
        Vamos aprender a consultar o stock de materiais no programa.

        Clique na secção ARMAZÉM e depois em Stock ou Consultar Materiais.

        Aqui pode ver todos os materiais disponíveis, organizados por código SAP ou código interno.

        Cada material mostra:
        - O código
        - A descrição
        - A quantidade atual em armazém
        - O tipo de material
        - O armazém onde se encontra

        Tem várias formas de pesquisar:

        Primeira: Use a barra de pesquisa no topo para procurar por código ou descrição.

        Segunda: Use os filtros para filtrar por tipo de material, armazém ou fornecedor.

        Terceira: Ordene a tabela clicando nos cabeçalhos das colunas.

        Se quiser exportar os dados para Excel, tem um botão de exportação no topo.

        Isto é muito útil para fazer análises fora do programa ou para partilhar com colegas.

        Pode consultar o histórico de movimentos de qualquer material clicando no código.
        """.strip(),
        "navegacao": [
            ("armazem_menu", "Expandir menu ARMAZÉM"),
            ("stock_consultar", "Abrir secção Stock"),
            ("tabela_completa", "Tabela de materiais visível"),
            ("pesquisa_ativa", "Barra de pesquisa"),
            ("filtros_vistos", "Filtros disponíveis"),
            ("exportar_excel", "Botão de exportar"),
        ]
    },
    {
        "id": 3,
        "titulo": "Entradas - Registar Chegadas",
        "duracao": "3:30",
        "narrador": """
        Agora vamos aprender a registar uma entrada de material no armazém.

        Uma entrada pode vir de três fontes principais:

        Primeira: Um pedido de compra ao fornecedor. Tem o número do pedido de compra e a guia de remessa.

        Segunda: Uma importação do SAP, quando recebe um ficheiro Excel com movimentos.

        Terceira: Uma entrada manual, quando tem material que não está ligado a um pedido.

        Vamos começar com uma entrada por número de pedido de compra.

        Clique em ARMAZÉM e depois em Entradas ou Registar Chegadas.

        Escolha a opção "Por número de pedido de compra".

        Preencha ou procure o número do pedido. Selecione o fornecedor.

        O sistema mostra as linhas desse pedido que ainda não foram recebidas.

        Para cada linha, introduza a quantidade recebida e a data da entrada.

        Se recebeu parcialmente, introduza a quantidade parcial.

        Quando confirma, o stock é atualizado automaticamente.

        A entrada fica registada com a data, o fornecedor, o pedido, a guia de remessa e o utilizador que a registou.

        Isto permite rastrear exactamente de onde vem cada material.
        """.strip(),
        "navegacao": [
            ("armazem_entradas", "Abrir secção Entradas"),
            ("entrada_por_pedido", "Escolher entrada por número de pedido"),
            ("formulario_entrada", "Formulário preenchido"),
            ("quantidade_recebida", "Campo de quantidade visível"),
            ("data_entrada", "Data da entrada"),
            ("confirmar_entrada", "Botão confirmar"),
        ]
    },
    {
        "id": 4,
        "titulo": "Saídas - Registar Saídas",
        "duracao": "3:30",
        "narrador": """
        Vamos aprender a registar uma saída de material do armazém.

        Uma saída significa que o material sai da DTE, quer para ser usado numa obra, quer para outras fins.

        Clique em ARMAZÉM e depois em Saídas.

        Escolha a obra de destino onde o material vai ser usado.

        Procure o código do material que pretende usar.

        O programa mostra a quantidade disponível em armazém.

        Se tentar sair mais material do que tem disponível, o programa avisa e não deixa prosseguir.

        Introduza a quantidade que vai usar, a data da saída, e o destino especifico se necessário.

        Pode adicionar notas sobre a saída, por exemplo "Poste 05-15" ou "Manutenção".

        Quando confirma, o stock é atualizado e a saída fica registada com todos os detalhes.

        Depois pode consultar o histórico de saídas em qualquer altura.

        Se cometeu um erro, tem a opção de reverter a saída e o stock volta ao estado anterior.
        """.strip(),
        "navegacao": [
            ("armazem_saidas", "Abrir secção Saídas"),
            ("selecionar_obra", "Escolher obra de destino"),
            ("procurar_material", "Procurar material"),
            ("quantidade_disponivel", "Quantidade em stock visível"),
            ("quantidade_sair", "Campo de quantidade a sair"),
            ("confirmar_saida", "Confirmar a saída"),
        ]
    },
    {
        "id": 5,
        "titulo": "Transferências entre Armazéns",
        "duracao": "3:00",
        "narrador": """
        Nesta secção vamos aprender a transferir material entre diferentes armazéns ou entre obras.

        Uma transferência é diferente de uma saída. É um movimento interno onde o material sai de um sítio e entra noutro.

        Clique em ARMAZÉM e depois em Transferências.

        Escolha o armazém de origem onde o material se encontra atualmente.

        Depois escolha o armazém ou obra de destino.

        Procure o material que pretende transferir.

        Introduza a quantidade a transferir.

        Se tem uma guia de remessa, pode adicionar o número da guia para rastreabilidade.

        Introduza a data da transferência.

        O sistema verifica se tem quantidade suficiente no armazém de origem.

        Quando confirma, o stock do armazém de origem diminui e o do destino aumenta no mesmo momento.

        A transferência fica registada com origem, destino, quantidade, data e guia.

        Isto é importante para manter a rastreabilidade de todos os movimentos.
        """.strip(),
        "navegacao": [
            ("armazem_transferencias", "Abrir secção Transferências"),
            ("armazem_origem", "Escolher armazém de origem"),
            ("armazem_destino", "Escolher armazém de destino"),
            ("procurar_material_trans", "Procurar material"),
            ("quantidade_transferir", "Quantidade a transferir"),
            ("numero_guia", "Campo de número de guia"),
            ("confirmar_transferencia", "Confirmar transferência"),
        ]
    },
    {
        "id": 6,
        "titulo": "Encomendas - Pedidos de Compra",
        "duracao": "3:30",
        "narrador": """
        Vamos aprender a consultar e gerir pedidos de compra.

        Um pedido de compra é uma encomenda que fez ao fornecedor.

        O programa tem ligação com o SAP onde se registam todos os pedidos.

        Clique em ARMAZÉM e depois em Encomendas ou Pedidos de Compra.

        Pode ver todos os pedidos da obra selecionada, organizados por estado.

        Cada pedido mostra:
        - O número do pedido de compra
        - O fornecedor
        - A data do pedido
        - A quantidade pedida de cada material
        - A quantidade a ser fornecida ainda

        Se a quantidade "A ser fornecida" é maior que zero, significa que ainda não recebeu todo o pedido.

        Quando faz uma entrada de material, a quantidade "A ser fornecida" diminui automaticamente.

        Quando chega a zero, significa que recebeu toda a encomenda.

        Pode filtrar os pedidos por fornecedor, por período de data ou por estado.

        Se recebeu um ficheiro de importação do SAP, pode usar o botão de importação para atualizar os pedidos.

        Esta secção é essencial para controlar o que encomendou e o que já chegou.
        """.strip(),
        "navegacao": [
            ("armazem_encomendas", "Abrir secção Encomendas"),
            ("lista_pedidos", "Lista de pedidos visível"),
            ("numero_pedido", "Número do pedido"),
            ("fornecedor_pedido", "Fornecedor"),
            ("status_fornecimento", "Campo 'A ser fornecida'"),
            ("filtrar_pedidos", "Filtros de pedidos"),
            ("importar_sap", "Botão importar do SAP"),
        ]
    },
    {
        "id": 7,
        "titulo": "Consumos - Relatório de Saídas",
        "duracao": "3:00",
        "narrador": """
        Nesta secção vamos ver como consultar um relatório de consumos.

        Um consumo é o material que saiu da DTE para ser usado numa obra.

        Este relatório é muito importante para medir o custo de cada obra e para reconciliação mensal com o SAP.

        Clique em GESTÃO e depois em Consumos ou Relatório de Saídas.

        O programa mostra um sumário de consumos por período.

        Pode escolher o período que pretende consultar: mensal, trimestral ou personalizado.

        O relatório mostra:
        - O código do material
        - A descrição
        - A quantidade consumida
        - O valor unitário do material
        - O valor total

        Pode filtrar por material, por tipo de material ou por data.

        Se quiser, pode exportar para Excel para fazer análises mais profundas.

        O programa soma automaticamente os consumos e calcula o valor total.

        Este relatório é usado mensalmente para reconciliar com o SAP e garantir que os números batem.
        """.strip(),
        "navegacao": [
            ("gestao_consumos", "Abrir secção Consumos"),
            ("selecionar_periodo", "Escolher período"),
            ("tabela_consumos", "Tabela de consumos"),
            ("sumario_consumos", "Sumário total"),
            ("filtros_consumos", "Filtros disponíveis"),
            ("exportar_consumos", "Botão exportar para Excel"),
        ]
    },
    {
        "id": 8,
        "titulo": "Projeto - Visualizar Postes",
        "duracao": "3:30",
        "narrador": """
        Vamos explorar a secção de Projeto, onde pode ver a estrutura de postes e desenhos técnicos.

        O projeto de Vendas Novas tem 448 postes e pórticos diferentes.

        Cada um tem um número único, como 04-26, 05-15 ou 64-29_30.

        Clique em PROJETO e depois em Projeto ou Visualizar Postes.

        Pode procurar um poste pelo seu número.

        Quando encontra, o programa mostra:
        - O tipo de poste (simples, pórtico, etc.)
        - Os desenhos associados
        - As estruturas
        - Os equipamentos
        - Os materiais necessários

        Cada desenho é clicável e abre um PDF com o desenho técnico completo.

        Isto é muito útil para saber exactamente o que precisa para cada poste.

        Os desenhos vêm dos cadernos de montagem da ferramenta de catenária.

        Pode abrir qualquer desenho para consultar as medidas, referências técnicas e submontagens.

        Esta integração com os desenhos torna fácil saber quanto material precisa para cada poste.
        """.strip(),
        "navegacao": [
            ("projeto_menu", "Expandir menu PROJETO"),
            ("projeto_postes", "Abrir secção Projeto"),
            ("procurar_poste", "Barra de pesquisa de postes"),
            ("ficha_poste", "Ficha de um poste"),
            ("desenhos_pdf", "Links para desenhos PDF"),
            ("componentes_poste", "Componentes do poste listados"),
        ]
    },
    {
        "id": 9,
        "titulo": "Materiais por Poste",
        "duracao": "3:00",
        "narrador": """
        Nesta secção vamos ver os materiais necessários para cada poste.

        Esta é uma vista comercial muito importante para saber quanto material precisa para executar uma obra.

        Clique em PROJETO e depois em Materiais por Poste.

        Procure o número do poste que pretende consultar.

        O programa mostra uma lista completa de todos os materiais necessários para esse poste.

        Para cada material mostra:
        - O código SAP
        - O código interno
        - A descrição
        - A quantidade exacta necessária
        - O tipo de material
        - O estado da disponibilidade em armazém

        Se tem avarias ou sobresselentes especiais, aparecem aqui também.

        Pode clicar em qualquer material para ver o histórico de preços ou as notas técnicas.

        Esta lista é actualizada automaticamente quando os desenhos mudam.

        Se precisa de saber quanto material precisa para vários postes, pode gerar um relatório consolidado.

        Isto torna muito fácil fazer orçamentos e pedidos de compra pré-calculados.
        """.strip(),
        "navegacao": [
            ("projeto_materiais_poste", "Abrir secção Materiais por Poste"),
            ("procurar_poste_materiais", "Procurar poste"),
            ("lista_materiais_poste", "Lista de materiais"),
            ("quantidade_exacta", "Quantidades por material"),
            ("estado_disponibilidade", "Indicador de disponibilidade"),
            ("detalhe_material", "Detalhes de um material"),
        ]
    },
    {
        "id": 10,
        "titulo": "Relatórios - Análises",
        "duracao": "3:30",
        "narrador": """
        Vamos aprender a usar os relatórios de análise do programa.

        Os relatórios são muito importantes para tomar decisões sobre gestão de stock.

        Clique em GESTÃO e depois em Relatórios ou Análises.

        Tem vários tipos de relatório disponíveis:

        Primeiro: Relatório de Stock - mostra o valor total do stock em armazém e distribuição por material.

        Segundo: Relatório de Movimentos - mostra todas as entradas e saídas num período.

        Terceiro: Relatório de Consumos - resumo dos consumos por poste ou por período.

        Quarto: Relatório de Encomendas Pendentes - mostra o que ainda está à espera de chegar.

        Quinto: Análise de Rotação - mostra quais os materiais que mais se movem e quais estão parados.

        Para cada relatório pode:
        - Escolher o período de tempo
        - Filtrar por categoria de material
        - Filtrar por obra
        - Exportar para Excel ou PDF

        Os gráficos ajudam a visualizar os dados de forma rápida.

        Se precisa de informação mais detalhada, pode sempre descer para a tabela completa.

        Esta secção é perfeita para apresentações ao departamento comercial ou à direcção.
        """.strip(),
        "navegacao": [
            ("gestao_relatorios", "Abrir secção Relatórios"),
            ("tipo_relatorio", "Escolher tipo de relatório"),
            ("periodo_relatorio", "Selecionar período"),
            ("filtros_relatorio", "Filtros aplicados"),
            ("grafico_relatorio", "Gráfico visível"),
            ("tabela_relatorio", "Tabela de dados"),
            ("exportar_relatorio", "Botão exportar"),
        ]
    },
    {
        "id": 11,
        "titulo": "Backup e Restauração",
        "duracao": "2:30",
        "narrador": """
        Vamos aprender como fazer backup e restaurar dados.

        Os dados do programa são guardados no navegador, no localStorage.

        Se por alguma razão perder dados ou precisar de recuperar uma versão anterior, pode usar o backup.

        Para fazer um backup, clique no botão "Backup (JSON)" no topo.

        O programa gera um ficheiro JSON com todos os seus dados e baixa-o automaticamente.

        Guarde este ficheiro num local seguro, como a pasta OneDrive da empresa ou um USB.

        O nome do ficheiro inclui a data e hora, facilitando a identificação de qual era a versão.

        Faça backup regularmente, especialmente antes de fazer grandes mudanças nos dados.

        Se precisar de restaurar, clique no botão "Restaurar" e escolha o ficheiro JSON que tem guardado.

        O programa mostra uma confirmação antes de restaurar, para evitar erros.

        Depois de restaurar, o programa recarrega com todos os dados da versão anterior.

        Nota: O backup e restauração funcionam perfeitamente para dados locais.

        No futuro, quando o programa for colocado online, haverá backups automáticos no servidor.
        """.strip(),
        "navegacao": [
            ("botao_backup_json", "Botão Backup JSON destacado"),
            ("backup_feito", "Confirmação de backup realizado"),
            ("botao_restaurar", "Botão Restaurar"),
            ("selecionar_ficheiro", "Diálogo de selecção de ficheiro"),
            ("confirmar_restauracao", "Confirmação de restauração"),
            ("dados_restaurados", "Programa após restauração"),
        ]
    },
    {
        "id": 12,
        "titulo": "Definições - Configurar",
        "duracao": "3:00",
        "narrador": """
        Finalmente, vamos ver como configurar o programa segundo as suas necessidades.

        As definições permitem personalizar o programa para a sua obra específica.

        Clique em GESTÃO e depois em Definições ou Configurar.

        Na secção de Armazéns, pode adicionar novos armazéns ou modificar os existentes.

        Cada armazém tem um nome e uma localização, importante para organizar o stock.

        Na secção de Materiais, pode criar tipos de material personalizados.

        Isto ajuda a organizar melhor o seu catálogo.

        Na secção de Fornecedores, pode adicionar novos fornecedores ou actualizar os existentes.

        Cada fornecedor tem um código SAP e contactos para referência.

        Na secção de Parâmetros, pode configurar opções gerais do programa.

        Por exemplo: moeda, idioma, formato de data, etc.

        Se quer resetar tudo para o estado inicial, tem um botão para isso também.

        Use com cuidado, porque apaga todos os seus dados!

        Se cometeu um erro nas definições, pode sempre restaurar de um backup anterior.

        As definições permitem que o programa seja adaptável para diferentes contextos e empresas.
        """.strip(),
        "navegacao": [
            ("gestao_definicoes", "Abrir secção Definições"),
            ("secao_armazens", "Secção Armazéns"),
            ("novo_armazem", "Botão novo armazém"),
            ("secao_materiais", "Secção Materiais"),
            ("secao_fornecedores", "Secção Fornecedores"),
            ("secao_parametros", "Secção Parâmetros"),
        ]
    },
]

# ============================================================================
# FUNÇÕES
# ============================================================================

def salvar_script_narrador(secao):
    """Salva o script de narração em ficheiro de texto"""
    script_file = SCRIPTS_DIR / f"{secao['id']:02d}_{secao['titulo'].lower().replace(' ', '_')}_script.txt"

    with open(script_file, 'w', encoding='utf-8') as f:
        f.write(f"VÍDEO {secao['id']}: {secao['titulo'].upper()}\n")
        f.write(f"Duração estimada: {secao['duracao']}\n")
        f.write("=" * 80 + "\n\n")
        f.write("SCRIPT DE NARRAÇÃO (Português de Portugal):\n")
        f.write("-" * 80 + "\n\n")
        f.write(secao['narrador'])
        f.write("\n\n" + "=" * 80 + "\n\n")
        f.write("PASSOS DE NAVEGAÇÃO:\n")
        f.write("-" * 80 + "\n\n")
        for i, (passo, descricao) in enumerate(secao['navegacao'], 1):
            f.write(f"{i}. [{passo}] {descricao}\n")

    return script_file

def gerar_info_videos():
    """Gera um ficheiro JSON com informação de todos os vídeos"""
    info = {
        "projeto": "Gestão de Materiais de Catenária",
        "empresa": "DTE Instalações Especiais",
        "departamento": "Catenária",
        "total_videos": len(SECOES),
        "idioma": "Português de Portugal",
        "qualidade": "1080p",
        "formato": "MP4",
        "videos": []
    }

    for secao in SECOES:
        info["videos"].append({
            "numero": secao['id'],
            "titulo": secao['titulo'],
            "duracao_estimada": secao['duracao'],
            "ficheiro_script": f"{secao['id']:02d}_{secao['titulo'].lower().replace(' ', '_')}_script.txt",
            "ficheiro_audio": f"{secao['id']:02d}_{secao['titulo'].lower().replace(' ', '_')}_audio.wav",
            "ficheiro_video": f"{secao['id']:02d}_{secao['titulo'].lower().replace(' ', '_')}.mp4",
            "passos_navegacao": len(secao['navegacao']),
        })

    info_file = Path(__file__).parent / "info_videos.json"
    with open(info_file, 'w', encoding='utf-8') as f:
        json.dump(info, f, ensure_ascii=False, indent=2)

    return info_file

def main():
    print("=" * 80)
    print("GERADOR DE VÍDEOS TUTORIAIS - GESTÃO DE MATERIAIS DE CATENÁRIA")
    print("=" * 80)
    print()

    # Salvar todos os scripts
    print("1️⃣  Gerando scripts de narração...")
    print()

    for secao in SECOES:
        script_file = salvar_script_narrador(secao)
        print(f"   ✅ Vídeo {secao['id']:02d}: {secao['titulo']}")
        print(f"      📄 Script: {script_file.name}")
        print()

    # Gerar informação centralizada
    print("2️⃣  Gerando informação centralizada...")
    info_file = gerar_info_videos()
    print(f"   ✅ Ficheiro: {info_file.name}")
    print()

    # Informação resumida
    print("=" * 80)
    print("PRÓXIMOS PASSOS:")
    print("=" * 80)
    print()
    print("1. GERAR ÁUDIO (TTS em PT-PT):")
    print("   - Usar API Google Translate, Microsoft Cognitive Services ou similar")
    print("   - Converter cada script em ficheiro WAV")
    print()
    print("2. GRAVAR SCREENSHOTS/VÍDEOS:")
    print("   - Usar Playwright, Selenium ou OBS Studio")
    print("   - Seguir os passos de navegação de cada secção")
    print()
    print("3. PROCESSAR COM FFmpeg:")
    print("   - Juntar screenshots com transições")
    print("   - Adicionar áudio e legendas")
    print("   - Exportar para MP4")
    print()
    print("4. INTEGRAR NO MANUAL.html:")
    print("   - Adicionar links para vídeos")
    print("   - Fazer testes de funcionamento")
    print()
    print("📁 Scripts salvos em:", SCRIPTS_DIR)
    print("🎵 Áudio será em:", AUDIO_DIR)
    print("🎬 Vídeos serão em:", VIDEOS_DIR)
    print()
    print("=" * 80)

if __name__ == "__main__":
    main()
