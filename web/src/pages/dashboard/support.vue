<script setup lang="ts">
</script>

<template>
    <div
        class="tw-bg-[color:var(--theme-background-color-shade-4)] tw-rounded tw-p-3 tw-flex tw-justify-between tw-items-center">
        <h2>Manual Sistema Capsul</h2>
        <a href="https://wa.me/+553798050282" target="_blank" class="tw-flex tw-items-center">
            <aeria-icon icon="phone" style="--icon-size: 1.2rem" reactive>Suporte ao Cliente</aeria-icon>
        </a>
    </div>

    <aeria-accordion enumerate :headers="{
        'question-criacao-ticket': 'Como criar um ticket?',
        'question-prioridades': 'Como definir prioridades?',
        'question-status': 'Quais são os status dos tickets?'
    }">
        <template #question-criacao-ticket>
            <ol class="tw-list-decimal tw-list-inside tw-space-y-2">
                <li>Na tela principal clique em <strong>Adicionar</strong>.</li>
                <li>Preencha o campo <strong>Assunto</strong> com uma descrição breve do problema ou demanda.</li>
                <li>Selecione o <strong>Sistema</strong> relacionado ao ticket.</li>
                <li>Escolha a <strong>Prioridade</strong> do ticket.</li>
                <li>Insira uma <strong>Descrição</strong> detalhada da situação ou pedido.</li>
                <li>Adicione um <strong>Anexo</strong> relevante.</li>
                <li>Clique em <strong>Inserir</strong> para salvar o ticket no sistema.</li>
            </ol>
        </template>

        <template #question-prioridades>
            <table class="tw-w-full tw-border">
                <thead>
                    <tr>
                        <th class="tw-py-2 tw-px-4">Prioridade</th>
                        <th class="tw-py-2 tw-px-4">Descrição</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="tw-py-2 tw-px-4 tw-text-[#539F2B]"><strong>Baixa</strong></td>
                        <td class="tw-py-2 tw-px-4">Demandas não urgentes que podem esperar para serem resolvidas. Não
                            comprometem a operação.</td>
                    </tr>
                    <tr>
                        <td class="tw-py-2 tw-px-4 tw-text-[#B38705]"><strong>Moderada</strong></td>
                        <td class="tw-py-2 tw-px-4">Questões com impacto moderado que não precisam de resolução
                            imediata.</td>
                    </tr>
                    <tr>
                        <td class="tw-py-2 tw-px-4 tw-text-[#F44336]"><strong>Urgente</strong></td>
                        <td class="tw-py-2 tw-px-4">Demandas que precisam de atenção imediata, pois podem afetar
                            severamente a operação ou serviços.</td>
                    </tr>
                </tbody>
            </table>
        </template>

        <template #question-status>
            <table class="tw-w-full tw-border">
                <thead>
                    <tr>
                        <th class="tw-py-2 tw-px-4">Status</th>
                        <th class="tw-py-2 tw-px-4">Descrição</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="tw-py-2 tw-px-4 tw-text-[#4CAF50]"><strong>Ativo</strong></td>
                        <td class="tw-py-2 tw-px-4">O ticket foi criado e ainda não foi atendido.</td>
                    </tr>
                    <tr>
                        <td class="tw-py-2 tw-px-4 tw-text-[#FF9800]"><strong>Reparando</strong></td>
                        <td class="tw-py-2 tw-px-4">O ticket está em processo de resolução, com um responsável
                            trabalhando na demanda.</td>
                    </tr>
                    <tr>
                        <td class="tw-py-2 tw-px-4 tw-text-[#2196F3]"><strong>Resolvido</strong></td>
                        <td class="tw-py-2 tw-px-4">O ticket foi concluído e a demanda foi resolvida.</td>
                    </tr>
                </tbody>
            </table>
        </template>
    </aeria-accordion>
</template>
