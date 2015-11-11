from django.test.testcases import TestCase

from core.models import Pillar
from target.models import Target


class PillarModelTest(TestCase):
    '''
    Test case for basic pillar model schema
    '''
    def tearDown(self):
        Pillar.objects.all().delete()

    def test_create_model(self):
        pillar = Pillar.objects.create(
            name='foobar',
            data='{"some": "jsonstring"}')

        self.assertEquals(pillar.name, 'foobar')
        self.assertEquals(pillar.data, {"some": "jsonstring"})


class TargetPillarRelationTest(TestCase):
    def tearDown(self):
        Pillar.objects.all().delete()
        Target.objects.all().delete()

    def test_target_pillar_relation(self):
        pillar1 = Pillar.objects.create(
            name='foobar',
            data='{"some": "jsonstring"}')

        pillar2 = Pillar.objects.create(
            name='foobar2',
            data='{"- jsonstring2"}')

        target = Target.objects.create(target_name='target1')
        target.pillars.add(pillar1)

        self.assertEquals(1, len(target.pillars.all()),
            'Should have 1 pillar assigned')

        target.pillars.add(pillar2)

        self.assertEquals(2, len(target.pillars.all()),
            'Should have 2 pillars assigned')

    def test_pillar_target_relation(self):
        pillar = Pillar.objects.create(
            name='foobar',
            data='{"some": "jsonstring"}')

        target1 = Target.objects.create(target_name='target1')
        target2 = Target.objects.create(target_name='target2')

        pillar.targets.add(target1)

        self.assertEquals(1, len(pillar.targets.all()),
            'Should have 1 target')

        pillar.targets.add(target2)

        self.assertEquals(2, len(pillar.targets.all()),
            'Should have 2 targets')
